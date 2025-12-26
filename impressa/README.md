# Impressa E-Commerce Platform

A full-stack multi-vendor e-commerce platform built with React and Node.js, specifically designed for Rwanda.

## 🚀 Features

- Multi-vendor marketplace
- Rwanda-specific addressing (Province → District → Sector → Cell)
- MTN Mobile Money payment integration
- Real-time order tracking
- Admin dashboard with analytics
- Responsive dark mode UI
- Guest checkout support

## 📋 Tech Stack

**Frontend:**
- React 18
- React Router v6
- Context API for state management
- Pure CSS (no Tailwind)

**Backend:**
- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Bcrypt for password hashing

## 🛠️ Local Development

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd impressa
```

2. **Install dependencies**
```bash
# Backend
cd impressa/impressa-backend
npm install

# Frontend
cd ../impressa-frontend
npm install
```

3. **Configure environment variables**
```bash
# Backend: Create .env in impressa-backend/
cp env.example .env
# Edit .env with your MongoDB URI and secrets
```

4. **Run development servers**
```bash
# Backend (http://localhost:5000)
cd impressa-backend
npm start

# Frontend (http://localhost:3000)
cd impressa-frontend
npm start
```

## 🌐 Deployment

### Quick Deploy (Free Tier)

**Frontend** → [Vercel](https://vercel.com)
**Backend** → [Render](https://render.com)
**Database** → [MongoDB Atlas](https://mongodb.com/cloud/atlas)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
impressa/
├── impressa-backend/       # Node.js API
│   ├── controllers/        # Route logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, error handling
│   └── utils/             # Helper functions
│
└── impressa-frontend/     # React app
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Page components
    │   ├── context/       # React Context
    │   ├── utils/         # Utilities
    │   └── styles/        # Global styles
    └── public/           # Static assets
```

## 🔑 Key Features

### Rwanda-Specific
- Hierarchical address system (Province/District/Sector/Cell)
- MTN Mobile Money integration
- Localized shipping zones
- Rwanda VAT (18%) calculation

### User Features
- Product browsing and search
- Shopping cart
- Guest and authenticated checkout
- Order tracking
- User profile management

### Admin Features
- Product management (CRUD)
- Order processing
- Shipping zone configuration
- Tax rate management
- Analytics dashboard

## 📄 License

This project is part of a Final Year Project (FYP).

## 👥 Contributors

[Your Name] - Developer

## 🎯 Demo

Live Demo: [Coming Soon]
