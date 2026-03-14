from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExerciseCreate(BaseModel):
    name: str
    description: str
    body_part_id: int

class WorkoutCreate(BaseModel):
    # user_id: int  要使用JWT認證系統獲取當前用戶的 ID，不從前端傳入 user_id
    exercise: str
    set_number: int
    reps: int
    weight: int

class NoteCreate(BaseModel):
    user_id: int
    content: str

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"