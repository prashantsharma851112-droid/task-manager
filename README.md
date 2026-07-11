# Task Manager App

A full-stack task management application that lets users create, update, filter, and delete tasks. Built to practice REST API design and full-stack integration.

## Features
- Phone number + OTP based registration and login (demo mode - OTP shown on screen instead of real SMS)
- Name collected at registration and shown after login
- JWT-based session tokens
- Each user only sees and manages their own tasks
- Create tasks with title, description, priority, and due date
- Update task status (Pending → In Progress → Completed)
- Filter tasks by status
- Delete tasks
- Priority-based color coding (High / Medium / Low)
- Responsive, clean UI

## Tech Stack
**Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
**Backend:** Node.js, Express.js, JWT, bcryptjs
**Database:** MongoDB (Mongoose ODM)

## Project Structure
```
task-manager/
├── backend/
│   ├── models/
│   │   └── Task.js          # Mongoose schema
│   ├── routes/
│   │   └── taskRoutes.js    # CRUD API routes
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## API Endpoints
| Method | Endpoint            | Description          | Auth required |
|--------|---------------------|-----------------------|---------------|
| POST   | /api/auth/send-otp  | Generate OTP for register or login (body: `{ phone, purpose }`) | No |
| POST   | /api/auth/verify-otp | Verify OTP and get a JWT (body: `{ phone, otp, purpose, name }`) | No |
| GET    | /api/tasks          | Get all tasks for the logged-in user (supports ?status= filter) | Yes |
| GET    | /api/tasks/:id      | Get a single task     | Yes |
| POST   | /api/tasks          | Create a new task     | Yes |
| PUT    | /api/tasks/:id      | Update a task          | Yes |
| DELETE | /api/tasks/:id      | Delete a task          | Yes |

Protected routes expect a header: `Authorization: Bearer <token>`

Note: the OTP is currently returned in the `send-otp` response and shown on screen for demo purposes, since no SMS provider is connected. In production, this would be replaced with a call to an SMS gateway (e.g. Twilio) and the OTP would not be exposed in the API response.

## Setup & Run Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Update MONGO_URI in .env if using MongoDB Atlas
npm start
```

### Frontend
Simply open `frontend/index.html` in a browser, or serve it with a live server extension.

Make sure the backend is running on `http://localhost:5000` before using the frontend.

## What I Learned
- Designing RESTful APIs with Express
- Structuring a Node.js backend with routes/models separation
- Connecting and querying MongoDB using Mongoose
- Handling async operations and error states on the frontend
- Building a responsive UI without a frontend framework

## Future Improvements
- Add user authentication (JWT)
- Add search functionality
- Migrate frontend to React
- Add pagination for large task lists
