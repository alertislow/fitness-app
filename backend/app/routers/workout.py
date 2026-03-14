from fastapi import FastAPI, Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import SessionLocal
from app.models import WorkoutSet
from app.schemas import WorkoutCreate

router = APIRouter(
    prefix="/workout",
    tags=["workout"]
)
# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST /workout/set
@router.post("/set")
def save_set(data: WorkoutCreate, db: Session = Depends(get_db)):
    workout = WorkoutSet(
        user_id = data.user_id,  # 這裡需要從前端傳入 user_id，或者從認證系統中獲取當前用戶的 ID
        exercise=data.exercise,
        set_number=data.set_number,
        reps=data.reps,
        weight=data.weight,
        date=datetime.utcnow()
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    return {"status": "saved", "data": workout}


# GET /workout/history
@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    workouts = db.query(WorkoutSet).all()

    return {
        "total": len(workouts),
        "data": workouts
    }


# PUT /workout/set/{id}
@router.put("/set/{id}")
def update_set(id: int, data: WorkoutCreate, db: Session = Depends(get_db)):

    workout = db.query(WorkoutSet).filter(WorkoutSet.id == id).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    workout.exercise = data.exercise
    workout.set_number = data.set_number
    workout.reps = data.reps
    workout.weight = data.weight

    db.commit()
    db.refresh(workout)

    return {"status": "updated", "data": workout}


# DELETE /workout/set/{id}
@router.delete("/set/{id}")
def delete_set(id: int, db: Session = Depends(get_db)):

    workout = db.query(WorkoutSet).filter(WorkoutSet.id == id).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    db.delete(workout)
    db.commit()

    return {"status": "deleted"}