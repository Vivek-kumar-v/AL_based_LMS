# 🚀 ConceptVault — AI Driven Learning Management System

<p align="center">
  <b>Transforming Notes into Knowledge with AI</b> 🧠📚  
</p>

<p align="center">
  <a href="https://al-driven-lms.vercel.app/">
    <img src="https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel" />
  </a>
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Made%20With-React%20%7C%20Node%20%7C%20AI-orange?style=for-the-badge" />
</p>

---

## 🌐 Live Application

👉 **Frontend:** https://al-driven-lms.vercel.app/

---

## 📌 Overview

**ConceptVault** is an **AI-powered Learning Management System (LMS)** that helps students:

* Upload notes & PYQs 📄
* Extract text using OCR 🤖
* Identify key concepts automatically 🧠
* Track weak areas 📉
* Perform smart search 🔍
* Visualize learning progress 📊

Unlike traditional LMS, ConceptVault doesn’t just store data — it **understands it**.

---

## ✨ Key Features

### 📤 Document Management

* Upload Notes & PYQs (PDF / Images)
* Cloud storage using Cloudinary
* Organized document listing

### 🤖 AI-Powered OCR

* Extract text from PDFs & images
* Image preprocessing:

  * Binarization
  * Noise removal
  * Deskewing
* Optional AI refinement using Gemini

### 🧠 Concept Extraction

* Automatically detects important concepts
* Normalizes and stores concepts
* Links concepts with documents

### 📊 Smart Dashboard

* Total uploads, searches, AI queries
* Weak concept detection
* Most repeated PYQ concepts
* Recent revision tracking

### 🔍 Smart Search

* Search by title, subject, semester
* Concept-based filtering

### 📚 Revision System

* Track revision history
* Improve weak areas

---

## 🧠 AI + Predictive Model

### 📌 Goal

Predict **weak concepts** based on usage and revision patterns.

### 📊 Strength Score Formula

```
StrengthScore = (R / (F + 1)) * 100
```

Where:

* **R** = Number of revisions
* **F** = Frequency in notes/PYQs

### ⚠️ Weak Concept Rule

```
If StrengthScore < Threshold → Weak Concept
```

---

## 🏗️ System Architecture

```
User Upload
↓
Cloudinary Storage
↓
OCR Service (FastAPI + Tesseract)
↓
Text Cleaning + AI Refinement
↓
Concept Extraction (NLP)
↓
MongoDB Storage
↓
Dashboard + Analytics + Search
```

---

## 🛠️ Tech Stack

### 🎨 Frontend

* React (Vite)
* TailwindCSS
* React Router
* Axios

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Cloudinary
* Multer

### 🤖 AI Service

* FastAPI
* Tesseract OCR
* OpenCV
* pdfplumber / pdf2image
* Gemini API

---

## 📂 Project Structure

```
AL_based_LMS/
│
├── backend/
├── ai-service/
├── frontend/
```

---

## ⚙️ Local Setup

### 1️⃣ Clone Repo

```bash
git clone https://github.com/Vivek-kumar-v/AL_based_LMS.git
cd AL_based_LMS
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment

| Service    | Platform   |
| ---------- | ---------- |
| Frontend   | Vercel     |
| Backend    | Render     |
| AI Service | Render     |
| Storage    | Cloudinary |

---

## 🧩 Challenges Solved

* OCR accuracy improvement using preprocessing
* JWT authentication with refresh tokens
* Cloudinary PDF handling (raw vs image)
* Preventing server sleep using cron ping
* Fixing React Router 404 issue on Vercel

---

## 🔮 Future Improvements

* Semantic search using embeddings
* Mobile app
* Faculty verification system
* Auto-generated student portfolio
* Smart revision recommendations

---

## 👨‍💻 Author

**Vivek Kumar**
CSE — NIT Manipur

🔗 GitHub: https://github.com/Vivek-kumar-v



