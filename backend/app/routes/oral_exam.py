from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.oral_exam_agent import (
    transcribe_audio,
    generate_oral_questions,
    evaluate_oral_answer,
    interactive_oral_response
)
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
import datetime

router = APIRouter()
db = get_firestore_client()


@router.post("/start/{document_id}")
async def start_oral_exam(
    document_id: str,
    count: int = Query(default=5, ge=1, le=10),
    language_code: str = Query(default="en"),
    persona: str = Query(default="university"),
    mode: str = Query(default="exam", description="exam or interactive"),
    user: dict = Depends(get_current_user)
):
    """
    Starts an oral session for a document.

    mode=exam: Agent asks questions, student answers, agent scores.
    mode=interactive: Student asks questions verbally, agent answers conversationally.
    """
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")
    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona.")
    if mode not in ["exam", "interactive"]:
        raise HTTPException(status_code=400, detail="mode must be exam or interactive")

    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    data = doc.to_dict()
    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    exam_ref = db.collection("oral_exams").document()

    if mode == "exam":
        questions = await generate_oral_questions(
            raw_text=data["raw_text"],
            subject=data["subject"],
            count=count,
            output_language_code=language_code,
            persona=persona
        )
        exam_ref.set({
            "user_id": user["uid"],
            "document_id": document_id,
            "title": data["title"],
            "subject": data["subject"],
            "language_code": language_code,
            "persona": persona,
            "mode": "exam",
            "questions": questions,
            "answers": [],
            "current_question": 0,
            "current_try": 0,
            "completed": False,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        return {
            "exam_id": exam_ref.id,
            "mode": "exam",
            "title": data["title"],
            "language_code": language_code,
            "persona": persona,
            "total_questions": len(questions),
            "first_question": questions[0]
        }
    else:
        # Interactive mode — no pre-generated questions
        exam_ref.set({
            "user_id": user["uid"],
            "document_id": document_id,
            "title": data["title"],
            "subject": data["subject"],
            "raw_text": data["raw_text"],
            "language_code": language_code,
            "persona": persona,
            "mode": "interactive",
            "conversation": [],
            "completed": False,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        return {
            "exam_id": exam_ref.id,
            "mode": "interactive",
            "title": data["title"],
            "language_code": language_code,
            "persona": persona,
            "message": "Interactive session started. Record your question and submit it."
        }


@router.post("/answer/{exam_id}")
async def submit_oral_answer(
    exam_id: str,
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    EXAM MODE — Student submits audio answer.
    Transcribes, evaluates, returns feedback and next question.
    """
    exam_ref = db.collection("oral_exams").document(exam_id)
    exam = exam_ref.get()
    if not exam.exists:
        raise HTTPException(status_code=404, detail="Exam not found")

    exam_data = exam.to_dict()
    if exam_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if exam_data.get("mode") == "interactive":
        raise HTTPException(status_code=400, detail="This is an interactive session. Use /oral-exam/ask/{exam_id} instead.")
    if exam_data["completed"]:
        raise HTTPException(status_code=400, detail="This exam is already completed")

    current_try = exam_data.get("current_try", 0)
    current_index = exam_data["current_question"]
    questions = exam_data["questions"]
    current_question = questions[current_index]
    language_code = exam_data.get("language_code", "en")
    persona = exam_data.get("persona", "university")

    audio_bytes = await audio.read()
    transcription = await transcribe_audio(audio_bytes, audio.filename, language_code)

    evaluation = await evaluate_oral_answer(
        question=current_question["question"],
        key_points=current_question["key_points"],
        student_answer=transcription,
        subject=exam_data["subject"],
        output_language_code=language_code,
        persona=persona
    )

    is_correct = evaluation.get("is_correct", False)
    if not isinstance(is_correct, bool):
        is_correct = evaluation.get("score", 0) >= 7

    try_num = current_try + 1
    should_advance = is_correct or try_num >= 3

    answers = exam_data.get("answers", [])

    if should_advance:
        answers.append({
            "question_id": current_question["id"],
            "question": current_question["question"],
            "transcription": transcription,
            "evaluation": evaluation
        })
        next_index = current_index + 1
        is_last = next_index >= len(questions)
        next_try = 0
    else:
        next_index = current_index
        is_last = False
        next_try = try_num

    exam_ref.update({
        "answers": answers,
        "current_question": next_index,
        "current_try": next_try,
        "completed": is_last,
        "completed_at": datetime.datetime.utcnow().isoformat() if is_last else None
    })

    response = {
        "transcription": transcription,
        "evaluation": evaluation,
        "is_correct": is_correct,
        "current_try": try_num,
        "max_tries": 3,
        "is_complete": is_last
    }

    if should_advance and not is_last:
        response["next_question"] = questions[next_index]
    elif is_last:
        avg_score = round(sum(a["evaluation"]["score"] for a in answers) / len(answers), 1)
        response["overall_score"] = avg_score
        response["overall_feedback"] = (
            "Excellent performance. You have a strong grasp of this subject." if avg_score >= 8
            else "Good effort. Review the concepts you struggled with." if avg_score >= 6
            else "Keep studying. Focus on the missed key points in each question."
        )

    return response


@router.post("/ask/{exam_id}")
async def submit_interactive_question(
    exam_id: str,
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    INTERACTIVE MODE — Student asks a question verbally.
    Agent transcribes the question and responds conversationally.
    Student can ask anything about the study material.
    """
    exam_ref = db.collection("oral_exams").document(exam_id)
    exam = exam_ref.get()
    if not exam.exists:
        raise HTTPException(status_code=404, detail="Session not found")

    exam_data = exam.to_dict()
    if exam_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if exam_data.get("mode") != "interactive":
        raise HTTPException(status_code=400, detail="This is an exam session. Use /oral-exam/answer/{exam_id} instead.")

    language_code = exam_data.get("language_code", "en")
    persona = exam_data.get("persona", "university")
    conversation = exam_data.get("conversation", [])

    audio_bytes = await audio.read()
    transcription = await transcribe_audio(audio_bytes, audio.filename, language_code)

    agent_reply = await interactive_oral_response(
        student_question=transcription,
        conversation_history=conversation,
        raw_text=exam_data.get("raw_text", ""),
        subject=exam_data["subject"],
        output_language_code=language_code,
        persona=persona
    )

    conversation.append({"role": "student", "content": transcription})
    conversation.append({"role": "agent", "content": agent_reply})

    exam_ref.update({
        "conversation": conversation,
        "last_updated": datetime.datetime.utcnow().isoformat()
    })

    return {
        "transcription": transcription,
        "reply": agent_reply,
        "conversation_length": len(conversation)
    }


@router.get("/results/{exam_id}")
async def get_exam_results(
    exam_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Returns results for a completed exam session.
    For interactive sessions returns the full conversation history.
    """
    exam_ref = db.collection("oral_exams").document(exam_id)
    exam = exam_ref.get()
    if not exam.exists:
        raise HTTPException(status_code=404, detail="Exam not found")

    exam_data = exam.to_dict()
    if exam_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if exam_data.get("mode") == "interactive":
        return {
            "exam_id": exam_id,
            "mode": "interactive",
            "title": exam_data["title"],
            "subject": exam_data["subject"],
            "language_code": exam_data.get("language_code", "en"),
            "persona": exam_data.get("persona", "university"),
            "conversation": exam_data.get("conversation", []),
            "total_exchanges": len(exam_data.get("conversation", [])) // 2
        }

    if not exam_data["completed"]:
        raise HTTPException(status_code=400, detail="Exam is not completed yet")

    answers = exam_data["answers"]
    avg_score = round(sum(a["evaluation"]["score"] for a in answers) / len(answers), 1)

    return {
        "exam_id": exam_id,
        "mode": "exam",
        "title": exam_data["title"],
        "subject": exam_data["subject"],
        "language_code": exam_data.get("language_code", "en"),
        "persona": exam_data.get("persona", "university"),
        "total_questions": len(exam_data["questions"]),
        "average_score": avg_score,
        "answers": answers,
        "completed_at": exam_data.get("completed_at")
    }
