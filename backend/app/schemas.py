from pydantic import BaseModel
from typing import Optional

class ExerciseCreate(BaseModel):
    name: str
    description: str
    body_part_id: int

class WorkoutCreate(BaseModel):
    user_id: int
    exercise_id: int
    sets: int
    reps: int
    weight: int

class NoteCreate(BaseModel):
    user_id: int
    content: str

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"