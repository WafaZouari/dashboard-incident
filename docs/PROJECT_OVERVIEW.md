# 🚀 Petrochemical Incident Dashboard

## 🌟 Overview
The **Petrochemical Incident Dashboard** is a state-of-the-art management and analytics platform designed specifically for high-stakes industrial environments. It provides real-time tracking, safety analytics, and AI-powered insights to help organizations identify risks, investigate incidents, and maintain a safer workplace.

---

## 🛠 Technology Stack (Why these?)

We chose a "Modern Full-Stack" approach to ensure the application is fast, reliable, and easy to maintain.

### 🎨 Frontend (The Interface)
- **React & TypeScript**: Provides a smooth, interactive user experience with "type-safety" (meaning fewer bugs during development).
- **Vite**: A lightning-fast build tool that makes the dashboard load almost instantly.
- **Tailwood/CSS**: Custom premium styling for a clean, professional "Enterprise" look.
- **Recharts & AG-Grid**: High-performance tools for data visualization and complex data tables.

### ⚙️ Backend (The Engine)
- **Node.js & Express**: A powerful, scalable server environment that handles data requests from the dashboard.
- **Prisma (ORM)**: Acts as a bridge between our code and the database, making data management simple and transparent.
- **PostgreSQL**: A robust, industrial-grade database to store incident records securely.

### 🤖 Artificial Intelligence
- **Ollama (Local AI)**: Used for private, on-premise AI processing (e.g., Llama 3) so sensitive data never leaves your network.
- **Google Gemini (Cloud AI)**: Used as a high-performance fallback for complex reasoning and analysis.

---

## 📂 Project Structure
```text
incident-dashboard/
├── frontend/     # User interface (React code)
├── backend/      # Server logic & API
├── prisma/       # Database schema & migrations
└── docs/         # Documentation (You are here!)
```

---

## 🎯 Key Features
1. **Real-time Analytics**: Visual heatmaps and charts showing safety trends.
2. **Incident Management**: Detailed tracking from the moment an incident is reported to its final investigation.
3. **AI Orchestrator**: Automatically summarizes incident reports and suggests corrective actions.
4. **Role-Based Access**: Secure login for Admins, Managers, and Investigators.
