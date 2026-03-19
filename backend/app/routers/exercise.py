# app/routers/exercise.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Exercise, BodyPart
from app.schemas import ExerciseOut

router = APIRouter(prefix="/exercise", tags=["exercise"])

@router.get("/body-parts")
def get_body_parts(db: Session = Depends(get_db)):
    return db.query(BodyPart).all()

# 取得所有 exercise
@router.get("/list", response_model=list[ExerciseOut])
def list_exercises(db: Session = Depends(get_db)):
    exercises = db.query(Exercise).all()
    return exercises

# 根據 exercise_id 取得 exercise 詳細資訊
@router.get("/{exercise_id}")
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return {
        "id": exercise.id,
        "name": exercise.name,
        "description": exercise.description,
        "body_part_id": exercise.body_part_id
    }