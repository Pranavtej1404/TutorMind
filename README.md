# 🚀 AI StudyMate

*AI StudyMate* is a personalized education assistant powered by Large Language Models (LLMs). It dynamically generates quizzes, provides instant explanations, and tracks learning progress — all tailored to each student's unique needs.

## ✨ Key Highlights

- 🧠 **Custom Quiz Generation**: Instantly create multiple-choice quizzes on any topic.
- 💬 **AI Tutor “Mate”**: An intelligent assistant that analyzes quiz performance and offers targeted concept reinforcement.
- 📊 **Interactive Dashboard**: Visualize your learning stats — including average scores, topic breakdowns, and total quizzes taken.
- 🔐 **User Authentication**: Secure login/registration system using JWT and hashed passwords.
- 💡 **No Database Required**: Currently runs on a fast in-memory store — perfect for prototyping or classroom use.

---

## 📚 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

---

## 🛠️ Tech Stack

### Frontend

- [Next.js](https://nextjs.org/) – Full-stack React framework
- [React](https://reactjs.org/) – UI components
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling
- [Recharts](https://recharts.org/) – Data visualization

### Backend

- [Node.js](https://nodejs.org/) – JavaScript runtime
- [Express.js](https://expressjs.com/) – API server

### AI Integration

- [Groq](https://groq.com/) – Ultra-fast LLM for quiz generation and chat  
  *(Swappable with Gemini, OpenAI, or other LLMs)*

### Authentication

- [JWT](https://jwt.io/) – Secure token-based authentication
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) – Password hashing

---

## ✅ Features

- 🔸 Generate topic-based multiple-choice quizzes
- 🤖 Ask AI Tutor "Mate" for explanations based on your quiz history
- 📈 Track performance with a user dashboard
- 🛡️ Secure authentication with JWT
- 💾 In-memory user and quiz store (for now — see Future section)
- 🖥️ Modern, responsive UI with Tailwind CSS

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node)
- A valid [Groq API Key](https://console.groq.com/)

---

### 🔧 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-studymate.git
cd ai-studymate
