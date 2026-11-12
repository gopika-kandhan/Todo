# ToDo Application

## 📌 Project Overview

The ToDo Application is a full-stack web application that helps users manage their daily tasks efficiently.

Users can register, log in, create tasks, view tasks, update tasks, and delete tasks.

## 🚀 Technologies Used

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## 📂 Project Structure

```text
new-todo/
│
├── backend/
│   ├── config/
│   ├── controller/
│   ├── dal/
│   ├── db/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── package.json
│
├── frontend/
│   └── client/
│       ├── src/
│       ├── public/
│       ├── index.html
│       └── package.json
│
├── postman/
├── .gitignore
└── README.md
```

## ✨ Features

- User Registration
- User Login
- JWT Authentication
- Password Hashing
- Create Tasks
- View Tasks
- Update Tasks
- Delete Tasks
- MongoDB Database Integration
- Protected API Routes

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
DB=todo
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend/client
npm install
npm run dev
```

## 🔐 Authentication

This application uses JWT (JSON Web Token) for user authentication.

Passwords are securely hashed using bcrypt before storing them in MongoDB.

## 📡 API Features

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/users/register | Register user |
| POST | /api/users/login | Login user |
| POST | /api/tasks/add | Create task |
| GET | /api/tasks/get | Get tasks |
| PUT | /api/tasks/update/:id | Update task |
| DELETE | /api/tasks/delete/:id | Delete task |

## 👨‍💻 Author

Developed as a full-stack MERN learning project.