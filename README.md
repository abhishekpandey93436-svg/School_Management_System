# Student Support Help Desk

A modern, high-performance two-way interactive ticket management and query resolution portal. Built with the MERN stack featuring role-based dashboards, secure file attachment infrastructure, and automated PDF analytics reporting.

## 🚀 Key Features

*   **Role-Based Access**: Dedicated iOS-styled glassmorphism dashboards for Students and Admins.
*   **Two-Way Interactive Chat**: Full query comment threading to allow active conversations between administrators and users.
*   **Media Support**: `multipart/form-data` enabled system allowing students to directly upload diagnostic files and screenshots within their ticket.
*   **Analytics & Verification**: Dynamic metric tracking on the Admin side with built-in instant one-click PDF generation via `jsPDF`.
*   **Secure Authentication**: OTP-verified account creation handled securely via JSON Web Tokens.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Redux Toolkit, Framer Motion, Material UI, jsPDF
*   **Backend**: Node.js, Express, MongoDB (Mongoose), Multer, Nodemailer, JWT

---

## 💻 Local Setup Instructions

Follow these steps to get the application running locally on your machine.

### 1. Requirements
*   Node.js (v18+ recommended)
*   MongoDB Cluster or Local MongoDB Instance

### 2. Backend Setup
1. CD into the backend directory:
   ```bash
   cd backends
   ```
2. Install NodeJS server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backends/` folder with the following credentials:
   ```env
   PORT=5000
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_secure_string>
   EMAIL_USER=<your_gmail>
   EMAIL_PASS=<app_password>
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and CD into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install React environment dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` folder to hook up the backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start the Vite Frontend server:
   ```bash
   npm run dev
   ```

### 4. Admin Access
Once running, you can register as an "Admin" role from the signup panel. Admins have priority control to view, sort, comment on, and resolve ticket issues globally.

---
