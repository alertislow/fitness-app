
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from fastapi import HTTPException 
from . import models, schemas
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Fitness API running"}


@app.post("/exercises")
def create_exercise(exercise: schemas.ExerciseCreate, db: Session = Depends(get_db)):
    obj = models.Exercise(**exercise.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/exercises")
def get_exercises(db: Session = Depends(get_db)):
    return db.query(models.Exercise).all()


@app.post("/workouts")
def create_workout(workout: schemas.WorkoutCreate, db: Session = Depends(get_db)):
    obj = models.Workout(**workout.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/workouts")
def get_workouts(db: Session = Depends(get_db)):
    return db.query(models.Workout).all()


@app.post("/notes")
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    obj = models.Note(**note.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()

# 新加入的刪除功能
@app.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    # 從資料庫找到指定 ID 的 exercise
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    
    if not exercise:
        # 如果找不到，回傳 404
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # 刪除資料
    db.delete(exercise)
    db.commit()
    
    return {"message": f"Exercise {exercise_id} deleted"}
