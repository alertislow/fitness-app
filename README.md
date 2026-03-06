# Fitness Tracker App

A full-stack fitness tracking web application built with **React + FastAPI**.  
Users can record workouts, view exercises, and write training notes.

---

## 🚀 Features

### User
- View exercise list
- Record workouts
- Write training notes
- Track workout history

### Admin
- Manage exercise database
- Add / Edit / Delete exercises
- Upload exercise descriptions and tips

---

## 🧠 Tech Stack

### Frontend
- React
- JavaScript
- Fetch API
- CSS

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Uvicorn

### Tools
- Git / GitHub
- VSCode
- Swagger API Docs

---

## 🏗 System Architecture

Frontend (React)
↓
API Request (Fetch)
↓
FastAPI Backend
↓
SQLAlchemy ORM
↓
SQLite Database


---

## 📂 Project Structure


fitness-tracker
│
├── frontend
│ ├── src
│ │ ├── pages
│ │ │ ├── ExerciseList.jsx
│ │ │ └── Exercises.jsx
│ │ ├── App.jsx
│ │ └── main.jsx
│
├── backend
│ ├── app
│ │ ├── main.py
│ │ ├── models.py
│ │ ├── schemas.py
│ │ └── database.py
│
├── README.md
└── .gitignore


---

## 📡 API Documentation

FastAPI automatically generates API docs.

After running backend:


http://127.0.0.1:8000/docs


Available APIs:

### Exercises
- `GET /exercises`
- `POST /exercises`
- `DELETE /exercises/{id}`

### Workouts
- `GET /workouts`
- `POST /workouts`

### Notes
- `GET /notes`
- `POST /notes`

---

## ⚙️ Local Development

### 1️⃣ Clone project


git clone https://github.com/yourname/fitness-tracker.git


---

### 2️⃣ Run Backend


cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload


Backend API:


http://127.0.0.1:8000


---

### 3️⃣ Run Frontend


cd frontend
npm install
npm run dev


Frontend:


http://localhost:5173


---

## 📸 Screenshots

(coming soon)

---

## 🔮 Future Features

- User authentication (JWT login)
- Admin dashboard
- Workout calendar
- Exercise images
- Mobile responsive UI
- AI exercise analysis

---

## 👨‍💻 Author

Created by Glenn Kuo

Fitness Coach × Developer  
Building AI-powered fitness tools.