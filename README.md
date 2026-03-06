
# Fitness Tracker (React + FastAPI)

A starter project for a workout tracking web app.

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:
http://127.0.0.1:8000

API docs:
http://127.0.0.1:8000/docs

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# System Architecture

```mermaid
flowchart LR

User[Mobile / Browser]
User --> React

React[React + Tailwind Frontend]

React -->|REST API| FastAPI

FastAPI[FastAPI Backend]

FastAPI --> DB[(SQLite / PostgreSQL)]

FastAPI --> Storage[Image Storage]
```

---

# Database ERD

```mermaid
erDiagram

USERS {
  int id
  string email
  string password
  string role
}

BODY_PARTS {
  int id
  string name
}

EXERCISES {
  int id
  string name
  int body_part_id
  string description
}

WORKOUTS {
  int id
  int user_id
  int exercise_id
  int sets
  int reps
  int weight
}

NOTES {
  int id
  int user_id
  string content
}

USERS ||--o{ WORKOUTS : records
USERS ||--o{ NOTES : writes

BODY_PARTS ||--o{ EXERCISES : contains

EXERCISES ||--o{ WORKOUTS : used_in
```
