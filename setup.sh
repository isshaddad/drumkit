#!/bin/bash

echo "🚀 Setting up Turvo Load Management App..."

# Setup Backend
echo "📦 Setting up Go backend..."
cd backend
go mod tidy
echo "✅ Backend setup complete!"

# Setup Frontend
echo "📦 Setting up React frontend..."
cd ../frontend
npm install
echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run the application:"
echo "1. Backend: cd backend && go run main.go"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "The app will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8080" 