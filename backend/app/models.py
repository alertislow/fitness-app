
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # hashed
    role = Column(String, default="member")


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


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Integer)


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
