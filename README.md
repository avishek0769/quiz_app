# Real-time Multiplayer Quiz App

A real-time multiplayer quiz application built with Node.js, Express, Socket.IO and MongoDB that allows users to create quiz rooms, invite friends, and compete against each other.

## Features

### Authentication & User Management
- JWT based authentication with access and refresh tokens
- User signup and login
- Profile management with avatar upload
- Friend system with real-time friend requests
- Online/offline status tracking
- Notification system for friend requests

### Quiz Rooms
- Create quiz rooms with different topics:
  - General Knowledge
  - Computer Science 
  - Mathematics
  - Sports
  - Geography
  - Anime/Manga
- 15 questions per quiz from selected topic
- Share room ID to invite participants
- Direct invite system for online friends
- Room admin controls (kick participants, start quiz, etc)

### Real-time Quiz Features
- 30 second timer for each question
- Points system:
  - Higher points for faster correct answers
  - -5 points for wrong answers
- First correct answer highlight
- Live leaderboard updates
- Final leaderboard with top 3 positions
- Like system to appreciate other participants

### User Stats
- Track total points earned
- Track total likes received
- View friend list with online/offline status

## Technology Stack

- **Frontend**: HTML, TailwindCSS, JavaScript
- **Backend**: Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **API Testing**: API Health Check Endpoint

## Environment Setup

1. Clone the repository
```bash
git clone [repository-url]
```
2. Install dependencies:
```bash
npm install
```
3. Configure environment variables in `.env`:
```env
MONGODB_CONNECTION_STRING=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. Start the server:
```bash
npm run dev
```

## Docker Support

Build and run using Docker:

```bash
docker build -t quiz-app .
docker run -p 3000:3000 quiz-app
```

## API Routes

- `/api/v1/user` - User management routes
- `/api/v1/room` - Room management routes  
- `/api/v1/leaderboard` - Leaderboard routes
- `/api/v1/notification` - Notification routes

## Socket Events

- `joinRoom` - When user joins a room
- `startQuiz` - Start quiz event
- `nextQuestion` - Move to next question
- `firstAnswer` - First correct answer notification
- `navigateToLead` - Navigate to leaderboard

## Contributing

Feel free to contribute to this project. Create a pull request with your proposed changes.

<!-- ## License

This project is licensed under the MIT License. -->