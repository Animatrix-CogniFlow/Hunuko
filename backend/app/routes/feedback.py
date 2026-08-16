from fastapi import APIRouter, Depends, HTTPException
from app.core.firebase_auth import get_current_user, get_firestore_client
from pydantic import BaseModel
from typing import Optional
import datetime

router = APIRouter()
db = get_firestore_client()

class FeedbackRequest(BaseModel):
    message: str
    page: Optional[str] = None
    category: Optional[str] = None  # bug, suggestion, praise, other
    rating: Optional[int] = None    # 1-5

@router.post("/submit")
async def submit_feedback(
    body: FeedbackRequest,
    user: dict = Depends(get_current_user)
):
    """
    Student submits feedback or a complaint.
    Saved to Firestore under feedback collection.
    You read this from Firebase console to see tester feedback.
    """
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Feedback message cannot be empty")

    if body.rating and not (1 <= body.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    feedback_ref = db.collection("feedback").document()
    feedback_ref.set({
        "user_id": user["uid"],
        "message": body.message.strip(),
        "page": body.page or "unknown",
        "category": body.category or "other",
        "rating": body.rating,
        "submitted_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "feedback_id": feedback_ref.id,
        "message": "Thank you for your feedback. We will review it shortly."
    }


@router.get("/all")
async def get_all_feedback(user: dict = Depends(get_current_user)):
    """
    Returns all feedback — for admin use only.
    In production you would add admin role check here.
    """
    results = db.collection("feedback")\
        .order_by("submitted_at", direction="DESCENDING")\
        .limit(100)\
        .stream()

    feedback_list = []
    for doc in results:
        data = doc.to_dict()
        feedback_list.append({
            "feedback_id": doc.id,
            **data
        })

    return {
        "total": len(feedback_list),
        "feedback": feedback_list
    }
