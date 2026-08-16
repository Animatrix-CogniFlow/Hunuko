import openai
from google import genai
from google.genai import types
from groq import Groq
from app.core.config import settings
from app.agents.language_agent import get_language_instruction, should_use_gemini
from app.agents.persona_agent import get_persona_instruction
from app.agents.gemini_utils import generate_content_with_fallback
import json, re, random, base64

openai.api_key = settings.OPENAI_API_KEY
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
groq_client = Groq(api_key=settings.GROQ_API_KEY)


async def transcribe_audio(audio_bytes: bytes, filename: str, language_code: str = "en") -> str:
    """
    Transcribes student audio to text.
    - Weak African languages → Gemini (with Groq fallback)
    - All other languages → OpenAI Whisper (with Groq fallback)
    """
    if should_use_gemini(language_code):
        try:
            response = generate_content_with_fallback(
                client=gemini_client,
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm"),
                    types.Part.from_text(text="Transcribe this audio exactly as spoken. Return only the transcribed text, nothing else.")
                ]
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini transcription failed: {e}. Falling back to Groq.")
    else:
        try:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=(filename, audio_bytes, "audio/webm"),
            )
            return transcript.text
        except Exception as e:
            print(f"OpenAI Whisper failed: {e}. Falling back to Groq.")

    # Groq Whisper fallback
    try:
        transcript = groq_client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=(filename, audio_bytes),
        )
        return transcript.text
    except Exception as groq_err:
        raise groq_err


async def generate_oral_questions(
    raw_text: str,
    subject: str,
    count: int = 5,
    output_language_code: str = "en",
    persona: str = "university"
) -> list:
    """
    Generates open ended oral exam questions for EXAM MODE.
    Variation seed ensures questions are different on every attempt.
    """
    count = min(count, 10)
    variation_seed = random.randint(1, 10000)
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    prompt = f"""
    {language_instruction}

    You are an examiner conducting an oral exam on {subject}.
    Generate exactly {count} open ended questions based on the notes below.
    These questions will be asked verbally so they must be clear and conversational.
    {persona_instruction}

    This is attempt variation #{variation_seed} — generate completely fresh questions.

    Return a JSON array like this:
    [
        {{
            "id": 1,
            "question": "the question text written for this persona and language",
            "key_points": ["point the answer should cover", "another key point"]
        }}
    ]

    Rules:
    - Questions should require more than a one word answer
    - Each question should test understanding not just memory
    - Write questions in the tone appropriate for the persona
    - Return only valid JSON, no extra text

    Notes:
    {raw_text}
    """

    response = generate_content_with_fallback(
        client=gemini_client,
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def evaluate_oral_answer(
    question: str,
    key_points: list,
    student_answer: str,
    subject: str,
    output_language_code: str = "en",
    persona: str = "university"
) -> dict:
    """
    Evaluates a student's spoken answer in EXAM MODE.
    Content-based — works regardless of what language the student answered in.
    """
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    prompt = f"""
    {language_instruction}

    You are an examiner evaluating a student's oral answer in {subject}.
    {persona_instruction}

    Note: The student may have answered in a different language than the question.
    Evaluate purely based on whether the content of their answer covers the key points.
    Language of the answer does not affect the score.

    Question asked: {question}
    Key points a good answer should cover: {key_points}
    Student's answer: {student_answer}

    Return a JSON object:
    {{
        "score": a number from 0 to 10,
        "is_correct": true if score is 7 or above,
        "understanding": "poor | fair | good | excellent",
        "feedback": "feedback written in the tone appropriate for this persona and language",
        "clue": "if not correct, a supportive hint without giving the answer away. If correct, leave empty.",
        "correct_answer": "a concise complete model answer in the target language covering all key points",
        "covered": ["key points the student mentioned"],
        "missed": ["key points the student did not mention"]
    }}

    Return only valid JSON, no extra text.
    """

    response = generate_content_with_fallback(
        client=gemini_client,
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def interactive_oral_response(
    student_question: str,
    conversation_history: list,
    raw_text: str,
    subject: str,
    output_language_code: str = "en",
    persona: str = "university"
) -> str:
    """
    INTERACTIVE MODE — Student asks questions verbally and the agent answers.
    This is a voice-based study session, not an exam.
    The agent responds conversationally to whatever the student asks.
    """
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    history_text = ""
    for msg in conversation_history:
        role = "Student" if msg["role"] == "student" else "Agent"
        history_text += f"{role}: {msg['content']}\n"
    history_text += f"Student: {student_question}\nAgent:"

    prompt = f"""
    {language_instruction}

    You are a friendly oral study assistant helping a student learn {subject} through voice conversation.
    {persona_instruction}

    The student is studying this material:
    {raw_text[:3000]}

    You are in INTERACTIVE MODE — this is not an exam. The student asks YOU questions and you answer them.
    - Answer the student's question clearly and conversationally
    - Stay focused on the study material
    - If the student asks something outside the material, gently redirect them
    - Keep answers concise enough for a spoken conversation
    - Encourage the student naturally

    Conversation so far:
    {history_text}

    Respond naturally in the target language. Return only your spoken response, no JSON, no extra formatting.
    """

    response = generate_content_with_fallback(
        client=gemini_client,
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()
