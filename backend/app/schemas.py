from pydantic import BaseModel
from typing import Optional
# from datetime import datetime

class ExerciseBase(BaseModel):
    name: str
    description: str | None = None
    body_part_id: int

class ExerciseCreate(ExerciseBase):
    pass

# 運動記錄
class WorkoutCreate(BaseModel):
    # user_id: int  要使用JWT認證系統獲取當前用戶的 ID，不從前端傳入 user_id
    exercise_id: int
    set_number: int
    reps: int
    weight: float


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
        orm_mode = True