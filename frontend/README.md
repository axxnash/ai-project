# UPM Event Recommender - Frontend

React.js frontend for the UPM Event Recommender system.

## Features

- **Authentication**: Login and registration for students and admins
- **Event Management**: 
  - View all events
  - Create events (admin only)
  - Save events (students)
- **Student Profile**: Set interests and availability
- **AI Recommendations**: Get personalized event recommendations based on your profile

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://localhost:8000`):
```
VITE_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── context/         # React context (Auth)
│   ├── services/        # API service layer
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── package.json
└── vite.config.js
```
