# Fitness Tracker (React + FastAPI)

A full‑stack fitness tracking application designed to help users plan
workouts, record training sessions, and review historical performance.

This project is being built as a learning and portfolio project
combining **React frontend development**, **FastAPI backend APIs**, and
**database design for fitness data tracking**.

------------------------------------------------------------------------

# Project Vision

The goal of this application is to provide users with a structured
platform to:

-   Plan workouts by muscle group
-   Record workout sessions (sets, reps, weight)
-   Review weekly training distribution
-   Track long‑term training history
-   Learn exercise techniques with guided tutorials

------------------------------------------------------------------------

# Core Features

## 1. Workout Planner

Users can select a muscle group and perform planned exercises.

Muscle groups:

-   Chest
-   Legs
-   Back
-   Shoulders
-   Biceps
-   Triceps
-   Core

Example exercises:

-   Barbell Bench Press
-   Incline Dumbbell Press
-   Pec Deck
-   Squat
-   Romanian Deadlift

Users can:

-   Add exercises
-   Delete exercises
-   Record sets
-   Add training notes

------------------------------------------------------------------------

## 2. Workout Review

Allows users to analyze training history.

Features:

Weekly training distribution (pie chart)

Example:

Chest -- 40%\
Legs -- 20%\
Back -- 15%\
Shoulders -- 15%\
Core -- 10%

Users can also browse historical workouts by date:

Example record:

Date: 2026‑03‑09\
Exercise: Barbell Bench Press\
Weight: 100kg\
Reps: 10\
Sets: 5

------------------------------------------------------------------------

## 3. Muscle Training Guide

Provides educational content for exercises.

Example:

Leg training section:

-   Squat
-   Romanian Deadlift
-   Leg Press

Each exercise page includes:

-   Images or GIF demonstrations
-   Muscle activation explanation
-   Written instructions

------------------------------------------------------------------------

# System Architecture

High level system architecture:

User ↓ React Frontend ↓ REST API ↓ FastAPI Backend ↓ Database (SQLite /
PostgreSQL)

------------------------------------------------------------------------

# Frontend Architecture

React structure:

src/

pages/ - Login.jsx - Dashboard.jsx - Planner.jsx - Review.jsx -
Guide.jsx

components/ - Navbar.jsx - ExerciseCard.jsx - WorkoutCard.jsx -
Chart.jsx

features/ - exercises - workouts - guide

services/ - api.js

------------------------------------------------------------------------

# Backend Architecture

FastAPI API structure:

Auth API - POST /login - POST /register

Exercise API - GET /exercises - POST /exercises - DELETE /exercises/{id}

Workout API - POST /workouts - GET /workouts

Set API - POST /sets - GET /sets

Review API - GET /weekly-stats - GET /history

------------------------------------------------------------------------

# Database Design

Main tables:

users - id - email - password - created_at

muscle_groups - id - name

exercises - id - name - description - muscle_group_id

workouts - id - user_id - date - muscle_group_id

sets - id - workout_id - exercise_id - weight - reps - set_number

notes - id - workout_id - content

------------------------------------------------------------------------

# Development Roadmap

Current progress:

✔ Backend API setup (FastAPI)\
✔ Exercise API\
✔ React frontend setup\
✔ Exercise list display

Next steps:

1.  Improve exercise card UI
2.  Add exercise form
3.  Implement workout session tracking
4.  Build workout review analytics
5.  Implement muscle training guide

------------------------------------------------------------------------

# Tech Stack

Frontend

-   React
-   JavaScript
-   Axios

Backend

-   FastAPI
-   Python

Database

-   SQLite (development)
-   PostgreSQL (future production)

Visualization

-   Recharts or Chart.js

------------------------------------------------------------------------

# Future Improvements

-   User authentication system
-   Mobile responsive UI
-   Workout progress charts
-   AI‑assisted workout suggestions
-   Video exercise tutorials

------------------------------------------------------------------------

# Author

Fitness Coach learning **Python + AI + Software Development** to build
intelligent training tools.
