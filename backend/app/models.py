
from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
# from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # hashed
    role = Column(String, default="user")  # "user" or "admin"  預設註冊的爲"user"


class BodyPart(Base):
    __tablename__ = "body_parts"

    id = Column(Integer, primary_key=True)
    name = Column(String)


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    body_part_id = Column(Integer, ForeignKey("body_parts.id"))


# workout history table, 包含日期、exercise、sets、reps、weight等資訊，讓使用者可以查看過去的訓練紀錄
class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    set_number = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id")) 

    content = Column(String)
    image_url = Column(String, nullable=True)  # 之後放圖片