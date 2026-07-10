# Task Manager App

A full-stack task management application that lets users create, update, filter, and delete tasks. Built to practice REST API design and full-stack integration.

## Features
- Create tasks with title, description, priority, and due date
- Update task status (Pending → In Progress → Completed)
- Filter tasks by status
- Delete tasks
- Priority-based color coding (High / Medium / Low)
- Responsive, clean UI

## Tech Stack
**Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
**Backend:** Node.js, Express.js
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
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | /api/tasks         | Get all tasks (supports ?status= filter) |
| GET    | /api/tasks/:id      | Get a single task    |
| POST   | /api/tasks          | Create a new task     |
| PUT    | /api/tasks/:id      | Update a task          |
| DELETE | /api/tasks/:id      | Delete a task          |

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
