#!/bin/bash

# Start the backend server in the background
cd impressa/impressa-backend
echo "Starting backend server on port 8000..."
npm start &
BACKEND_PID=$!

# Start the frontend
cd ../impressa-frontend
echo "Starting frontend on port 5000..."
HOST=0.0.0.0 npm start

# If frontend exits, kill backend
kill $BACKEND_PID 2>/dev/null
