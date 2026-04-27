# 📂 Data Structure & Flow

This document explains how information flows through the system, for those who want to understand the "behind-the-scenes".

## 🛣 The Data Journey
1.  **Input**: A user enters data on the **Frontend** (React).
2.  **Request**: The frontend sends a request to the **Backend** (Node.js/Express API).
3.  **ORM (Prisma)**: The backend uses **Prisma** to translate code instructions into SQL commands.
4.  **Storage**: The data is permanently saved in the **PostgreSQL** database.

---

## 🏗 Core Entities (The Database Models)

| Entity | Description |
| :--- | :--- |
| **User** | Employees with specific roles (Admin, Manager, etc.). |
| **Incident** | The main record of a safety event. |
| **Location** | Physical sites or units (e.g., "Refinery A"). |
| **Investigation** | Detailed analysis linked to an incident. |
| **Action Item** | A task assigned to a user to prevent future incidents. |
| **Attachment** | Files or photos uploaded for an incident. |

---

## 🔍 Viewing the Data Directly
If you are a developer and want to browse the raw data without using the dashboard:

1.  Navigate to the `backend` folder.
2.  Run: `npx prisma studio`
3.  This will open a visual database browser at `http://localhost:5555`.

---

## 🔄 AI Orchestration
The system features a **Unified AI Service**. 
- It first tries to use **Ollama** (Private/Local).
- If Ollama is offline or busy, it automatically switches to **Google Gemini** (Cloud/High Performance).
- This ensures that incident analysis features are always available, even if your local server is under heavy load.
