from fastapi import APIRouter, Depends, HTTPException
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.persona_agent import SUPPORTED_PERSONAS, validate_persona, get_all_personas
from pydantic import BaseModel
import datetime

router = APIRouter()
db = get_firestore_client()

PERSONA_CHECK_DAYS = 30

class PersonaRequest(BaseModel):
    persona: str


@router.post("/persona")
async def set_persona(
    body: PersonaRequest,
    user: dict = Depends(get_current_user)
):
    """
    Sets the student's global persona.
    Records timestamp so the 30-day check can trigger.
    """
    if not validate_persona(body.persona):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid persona. Choose from: {list(SUPPORTED_PERSONAS.keys())}"
        )

    profile_ref = db.collection("profiles").document(user["uid"])
    profile_ref.set({
        "user_id": user["uid"],
        "persona": body.persona,
        "persona_name": SUPPORTED_PERSONAS[body.persona],
        "persona_set_at": datetime.datetime.utcnow().isoformat()
    }, merge=True)

    return {
        "message": f"Persona set to {SUPPORTED_PERSONAS[body.persona]}",
        "persona": body.persona,
        "persona_name": SUPPORTED_PERSONAS[body.persona]
    }


@router.get("/persona")
async def get_persona(user: dict = Depends(get_current_user)):
    """
    Returns the student's current persona.
    Also returns whether a 30-day persona review is due.
    """
    profile_ref = db.collection("profiles").document(user["uid"])
    profile = profile_ref.get()

    if profile.exists:
        data = profile.to_dict()
        persona = data.get("persona", "university")
        persona_set_at = data.get("persona_set_at")

        review_due = False
        if persona_set_at:
            set_date = datetime.datetime.fromisoformat(persona_set_at)
            days_since = (datetime.datetime.utcnow() - set_date).days
            review_due = days_since >= PERSONA_CHECK_DAYS

        return {
            "persona": persona,
            "persona_name": SUPPORTED_PERSONAS.get(persona, "University Student"),
            "persona_set_at": persona_set_at,
            "review_due": review_due,
            "days_until_review": max(0, PERSONA_CHECK_DAYS - (datetime.datetime.utcnow() - datetime.datetime.fromisoformat(persona_set_at)).days) if persona_set_at else 0
        }

    return {
        "persona": "university",
        "persona_name": "University Student (Ages 18-25)",
        "persona_set_at": None,
        "review_due": False,
        "days_until_review": 30
    }


@router.get("/personas")
async def list_personas(user: dict = Depends(get_current_user)):
    """Returns all available personas for the signup persona picker."""
    return {"personas": get_all_personas()}
