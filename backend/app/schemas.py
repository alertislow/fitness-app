from pydantic import BaseModel
from typing import Optional
# from datetime import datetime

class ExerciseBase(BaseModel):
    name: str
    body_part_id: int

class ExerciseCreate(ExerciseBase):
    pass

# 運動記錄
class WorkoutCreate(BaseModel):
    exercise_id: int
    # set_number: int
    reps: int
    weight: float

# 專門給運動記錄「更新」和「重排」使用
class WorkoutUpdate(WorkoutCreate):
    set_number: int  # 更新時必須包含序號

# 用戶建立
class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"

#用戶登入
class LoginSchema(BaseModel):
    email: str
    password: str

# 筆記
class NoteCreate(BaseModel):
    exercise_id: int
    content: str

# exercise的輸出格式，包含id、name、body_part_id等資訊，讓前端可以顯示完整的 exercise 資料(後端傳前端)
class ExerciseOut(ExerciseBase):
    id: int

    class Config:
        from_attributes = True  # Pydantic V2 的新寫法