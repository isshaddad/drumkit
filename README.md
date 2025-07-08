# Drumkit - Turvo Load Management Application

A full-stack web application for managing freight loads with integration to the Turvo TMS (Transportation Management System). The application provides a modern interface for viewing and creating load data with real-time synchronization to Turvo's API.

## 🌐 Live Application

**Frontend (Amplify):** https://main.d12n7x58zaq4la.amplifyapp.com/

**Backend (App Runner):** Deployed on AWS App Runner

## 🏗️ Architecture

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Go (Gin framework) + REST API
- **Deployment:** Frontend on AWS Amplify, Backend on AWS App Runner
- **Integration:** Turvo TMS API

## 🚀 Features

- **Load Management:** View freight loads from Turvo TMS
- **Real-time Data:** Synchronized with Turvo's API for up-to-date information
- **Load Creation:** Create new loads with comprehensive freight details
- **Pagination:** Efficient handling of large datasets

## 📋 Prerequisites

- Go 1.18+
- Node.js 16+
- Turvo TMS API credentials

## 🛠️ Setup

### Quick Setup

```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

```bash
# Backend
cd backend
go mod tidy

# Frontend
cd frontend
npm install
```

## 🔧 Environment Configuration

### Backend (.env)

Create `backend/.env`:

```env
TURVO_API_URL=https://api.turvo.com
TURVO_CLIENT_ID=you client id
TURVO_CLIENT_SECRET=your client secret
TURVO_USERNAME=your username
TURVO_PASSWORD=your password
TURVO_OAUTH_SCOPE= scope
TURVO_OAUTH_TYPE= account type
TURVO_X_API_KEY= turvo api key
TURVO_BASE_URL= turvo base url
```

### Frontend (.env)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8080
```

## 🚀 Running the Application

### Development

```bash
# Backend (Port 8080)
cd backend
go run main.go

# Frontend (Port 3000)
cd frontend
npm start
```

### Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
go build
./turvo-app
```

## 📡 API Endpoints

| Endpoint             | Method | Description                          |
| -------------------- | ------ | ------------------------------------ |
| `/api/loads`         | GET    | Retrieve loads (supports pagination) |
| `/api/loads`         | POST   | Create new load                      |
| `/api/shipments/:id` | GET    | Get shipment details                 |
| `/health`            | GET    | Health check                         |

### Example API Response

```json
{
  "success": true,
  "data": [
    {
      "externalTMSLoadID": "SHIP-001",
      "freightLoadID": "LOAD-001",
      "status": "ACTIVE",
      "customer": {
        "name": "ABC Company",
        "addressLine1": "123 Main St",
        "city": "New York",
        "state": "NY"
      },
      "pickup": {
        "addressLine1": "456 Pickup Ave",
        "city": "Los Angeles",
        "state": "CA"
      },
      "consignee": {
        "addressLine1": "789 Delivery Blvd",
        "city": "Chicago",
        "state": "IL"
      }
    }
  ],
  "hasMore": true
}
```

## 🧪 Testing

## 📁 Project Structure

```
drumkit/
├── backend/          # Go API server
├── frontend/         # React application
├── setup.sh          # Setup script
└── README.md
```

## 🔍 Troubleshooting

- **CORS Errors:** Ensure backend runs on port 8080
- **API Issues:** Verify Turvo credentials in `.env`
- **Build Issues:** Clear node_modules and reinstall

---

**Note:** Requires valid Turvo TMS API credentials to function.
