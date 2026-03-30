from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas import WorkoutCreate, WorkoutUpdate 
from app.models import WorkoutHistory
from app.core.security import get_current_user_id # JWT function
from typing import List


router = APIRouter(prefix="/workout",tags=["workout"])

# 輕量化API，讓日曆得知哪一天有運動並標示圖示，不用每次都要讀取整筆 get_history 影響效能
@router.get("/active-dates")
def get_active_dates(db: Session = Depends(get_db), current_user_id = Depends(get_current_user_id)):
    # 1. 使用 func.date 處理，並加上 .distinct() 讓資料庫只回傳不重複的日期

    # 只抓取日期
    dates = db.query(func.date(WorkoutHistory.date)).filter(
        WorkoutHistory.user_id == current_user_id
    ).distinct().all()
    
    # 回傳格式如: ["2026-03-23", "2026-03-24", "2026-03-25", "2026-03-26"]
    return [str(d[0]) for d in dates]

# POST /workout/set
@router.post("/set")
def save_set(
    data: list[WorkoutCreate],  # 改成 list
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id) # 從 JWT token 獲取當前用戶的 ID
    ): 
    # 找「今天」同一個 exercise 的最大 set_number，且爲臺灣時間
    now = datetime.utcnow() + timedelta(hours=8) # 轉換到臺灣時間
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    last_set = (
        db.query(WorkoutHistory)
        .filter(
            WorkoutHistory.user_id == current_user_id,
            WorkoutHistory.exercise_id == data[0].exercise_id,
            WorkoutHistory.date >= start_of_day  # 今天開始
        )
        .order_by(WorkoutHistory.set_number.desc())
        .first()
    )
    # 決定起始 set_number
    start_number = last_set.set_number if last_set else 0

    new_sets = []
    # 自動 +1（忽略前端傳的 set_number）
    for i, set_data in enumerate(data):
        workout = WorkoutHistory(
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
    workouts = db.query(WorkoutHistory).filter(WorkoutHistory.user_id == current_user_id).all()
    return {
        "total": len(workouts),
        "data": workouts
    }


# PUT /workout/set/{id}
@router.put("/set/{id}")
def update_set(id: int, data: WorkoutUpdate, db: Session = Depends(get_db)):

    workout = db.query(WorkoutHistory).filter(WorkoutHistory.id == id).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    workout.exercise_id = data.exercise_id
    workout.set_number = data.set_number 
    workout.reps = data.reps
    workout.weight = data.weight

    db.commit()
    db.refresh(workout)

    return {"status": "updated", "data": workout}


# DELETE /workout/set/{id}
@router.delete("/set/{id}")
def delete_set(id: int, db: Session = Depends(get_db)):

    workout = db.query(WorkoutHistory).filter(WorkoutHistory.id == id).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    db.delete(workout)
    db.commit()

    return {"status": "deleted"}

