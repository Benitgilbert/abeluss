# ABELUS - Multi-Vendor E-Commerce Platform

A full-stack MERN (MongoDB, Express, React, Node.js) multi-vendor e-commerce application. This platform connects customers, sellers, and administrators in a seamless shopping environment with advanced features like order tracking, reports, and payments.

## 🚀 Tech Stack

-   **Frontend:** React.js, Context API, CSS (Modules/Vanilla), Axios
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB (Mongoose)
-   **Authentication:** JWT (JSON Web Tokens), Google OAuth (Passport.js)
-   **Payment:** Mobile Money (MoMo) Integration
-   **Reporting:** PDFKit, CSV Export

## ✨ Key Features

### 1. User Roles
-   **Customer:** Browse products, manage cart, place orders, write reviews, custom wishlists.
-   **Seller:** Manage own products, view relevant orders, manage store profile.
-   **Admin:** Full system oversight, manage users/sellers, global settings, view all orders & reports.

### 2. Authentication & Security
-   **Secure Login:** Email/Password implementation with hashed passwords (Bcrypt).
-   **Google OAuth:** "Continue with Google" for one-click login/signup.
-   **Role-Based Access Control (RBAC):** Protected routes for Admin and Seller dashboards.
-   **Forgot Password:** OTP-based password reset flow.

### 3. Functional Modules
-   **Product Management:** Multi-vendor support. Sellers manage their own inventory.
-   **Multi-Seller Cart:** Add items from different sellers to a single cart.
-   **Order Processing:** Split orders internally by seller while keeping a unified customer view.
-   **Reviews:** Star ratings and comments for products.
-   **Search & Filtering:** Advanced filtering by category, price, and seller variables.

### 4. Payments
-   **Mobile Money (MoMo):** Integrated payment gateway for seamless transactions.
-   *(Planned: Stripe/PayPal integration)*

## 🛠️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Local or Atlas Connection String)
-   Google Cloud Console Project (for OAuth)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Benitgilbert/abelus.git
    cd abelus
    ```

2.  **Backend Setup**
    ```bash
    cd abelus-backend
    npm install
    ```
    *Create a `.env` file in `abelus-backend/` with:*
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    REFRESH_SECRET=your_refresh_secret
    FRONTEND_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
    ```

3.  **Frontend Setup**
    ```bash
    cd ../abelus-frontend
    npm install
    ```
    *Create a `.env` file in `abelus-frontend/` (optional for defaults):*
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    ```

### Running the Project

**Start Backend:**
```bash
cd abelus-backend
npm run dev
```

**Start Frontend:**
```bash
cd abelus-frontend
npm start
```

## 📁 Project Structure

```
abelus/
├── abelus-backend/       # Express API
│   ├── config/             # DB, Passport, Logger config
│   ├── controllers/        # Route logic
│   ├── models/             # Mongoose Schemas (User, Product, Order)
│   ├── routes/             # API Endpoints
│   ├── middleware/         # Auth, Validation, Uploads
│   └── server.js           # Entry point
│
└── abelus-frontend/      # React App
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Global State (Cart, Toast, Wishlist)
    │   ├── pages/          # Page views (Home, Shop, Admin, etc.)
    │   └── utils/          # Helpers (Axios, formatting)
```

## 📜 API Documentation

The backend exposes RESTful APIs at `/api`. Key endpoints include:

-   `POST /api/auth/register` - Create account
-   `POST /api/auth/login` - Login
-   `GET /api/auth/google` - Google OAuth
-   `GET /api/products` - List products
-   `POST /api/orders` - Create order
-   `GET /api/reports` - Generate PDF reports

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License
Proprietary to Abelus Custom Solutions. All rights reserved.
