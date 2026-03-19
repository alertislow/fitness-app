from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas import WorkoutCreate
from app.models import WorkoutSet
from app.core.security import get_current_user_id # JWT function

router = APIRouter(prefix="/workout",tags=["workout"])

# POST /workout/set
@router.post("/set")
def save_set(
    data: WorkoutCreate, 
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id) # 從 JWT token 獲取當前用戶的 ID
    ): 
    workout = WorkoutSet(
        user_id = current_user_id, #自動帶uer_id，不從前端傳入
        exercise_id=data.exercise_id,
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
def get_history( 
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id) # 從 JWT token 獲取當前用戶的 ID
):
    workouts = db.query(WorkoutSet).filter(WorkoutSet.user_id == current_user_id).all()
    # print("current_user_id:", current_user_id)
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

