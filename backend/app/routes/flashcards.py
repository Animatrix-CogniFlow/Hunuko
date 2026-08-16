from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.flashcard_agent import generate_flashcards
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
import datetime

router = APIRouter()
db = get_firestore_client()

@router.post("/generate/{document_id}")
async def create_flashcards(
    document_id: str,
    count: int = Query(..., ge=1, le=20, description="Number of flashcards to generate (1-20, REQUIRED)"),
    mode: str = Query(..., description="quick_recall or concept_check (REQUIRED)"),
    language_code: str = Query(default="en"),
    persona: str = Query(default="university"),
    user: dict = Depends(get_current_user)
):
    """
    Generates flashcards for a document.
    count and mode are REQUIRED — no silent defaults.
    """
    if mode not in ["quick_recall", "concept_check"]:
        raise HTTPException(status_code=400, detail="mode must be quick_recall or concept_check")
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")
    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail="Invalid persona.")

    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    data = doc.to_dict()
    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        flashcards = await generate_flashcards(
            raw_text=data["raw_text"],
            subject=data["subject"],
            count=count,
            mode=mode,
            output_language_code=language_code,
            persona=persona
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")

    flashcard_ref = db.collection("flashcards").document()
    flashcard_ref.set({
        "user_id": user["uid"],
        "document_id": document_id,
        "title": data["title"],
        "mode": mode,
        "language_code": language_code,
        "persona": persona,
        "flashcards": flashcards,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "flashcard_set_id": flashcard_ref.id,
        "title": data["title"],
        "mode": mode,
        "language_code": language_code,
        "persona": persona,
        "total_cards": len(flashcards),
        "flashcards": flashcards
    }


@router.get("/get/{document_id}")
async def get_flashcards(
    document_id: str,
    mode: str = Query(default="quick_recall"),
    user: dict = Depends(get_current_user)
):
    results = db.collection("flashcards")\
        .where("document_id", "==", document_id)\
        .where("user_id", "==", user["uid"])\
        .where("mode", "==", mode)\
        .limit(1).stream()

    for doc in results:
        return doc.to_dict()

    raise HTTPException(status_code=404, detail="No flashcards found. Try generating first.")
