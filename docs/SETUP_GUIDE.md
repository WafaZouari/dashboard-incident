# ⚙️ Setup & Installation Guide

This guide will help you get the project up and running on your local machine.

## 📋 Prerequisites
Before you start, make sure you have the following installed:
1.  **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2.  **PostgreSQL** (Database) - [Download here](https://www.postgresql.org/)
3.  **Ollama** (For AI features) - [Download here](https://ollama.com/)

---

## 🚀 Installation Steps

### 1. Clone & Install Dependencies
Open your terminal and run:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup
1.  Open **pgAdmin** or your preferred SQL tool.
2.  Create a new database named `incident_user`.
3.  Go to the `backend` folder and open the `.env` file.
4.  Update the `DATABASE_URL` with your PostgreSQL password:
    ```env
    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/incident_user"
    ```
5.  Run the database setup command (from the `backend` folder):
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

### 3. AI Setup (Ollama)
1.  Open the Ollama application.
2.  Run the following command in your terminal to download the AI model:
    ```bash
    ollama pull llama3
    ```

---

## 🏃 Running the Application
You can start both the frontend and backend with a single command from the **root folder**:
```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## 🔑 Login Credentials (Seed Data)
If you ran the `seed` command, you can log in with:
- **Email:** `admin@petrosite.com`
- **Password:** `Admin1234!`
