from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas import WorkoutCreate
from app.models import WorkoutSet
from app.core.security import get_current_user_id # JWT function
from typing import List

router = APIRouter(prefix="/workout",tags=["workout"])

# POST /workout/set
@router.post("/set")
def save_set(
    data: list[WorkoutCreate],  # 🔥 改成 list
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id) # 從 JWT token 獲取當前用戶的 ID
    ): 
    # 找「今天」同一個 exercise 的最大 set_number，且爲臺灣時間
    now = datetime.utcnow() + timedelta(hours=8) # 轉換到臺灣時間
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    last_set = (
        db.query(WorkoutSet)
        .filter(
            WorkoutSet.user_id == current_user_id,
            WorkoutSet.exercise_id == data[0].exercise_id,
            WorkoutSet.date >= start_of_day  # 今天開始
        )
        .order_by(WorkoutSet.set_number.desc())
        .first()
    )
    # 決定起始 set_number
    start_number = last_set.set_number if last_set else 0

    new_sets = []
    # 自動 +1（忽略前端傳的 set_number）
    for i, set_data in enumerate(data):
        workout = WorkoutSet(
            user_id = current_user_id, # 客戶user_id
            exercise_id=set_data.exercise_id, #對應部位id
            set_number=start_number + i + 1,  # 不使用前端傳的 set_number，改為從現有的組數再加1
            reps=set_data.reps,
            weight=set_data.weight,
            date=datetime.utcnow()
        )
        db.add(workout)
        new_sets.append(workout)

    db.commit()

    return {"status": "saved", "data": new_sets}


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

