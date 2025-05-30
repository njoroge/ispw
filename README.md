# MERN ISP Management System

A comprehensive web application built with the MERN stack (MongoDB, Express.js, React, Node.js) to simulate the core functionalities of an Internet Service Provider's (ISP) customer management and administration panel. This project demonstrates a full-stack application including user authentication, package management, simulated usage tracking, and an integration with M-Pesa for payment processing.

## Features Implemented

This system boasts a range of features designed to provide a realistic ISP management experience:

*   **User Authentication:**
    *   Secure user registration and login processes.
    *   JWT (JSON Web Token) based session management for persistent authentication.

*   **ISP Package Display:**
    *   A publicly accessible page listing all available internet packages with details such as name, speed, price, and data allowance.

*   **User Package Subscription:**
    *   Authenticated users can subscribe to available ISP packages.
    *   Simplified subscription mechanism linked to user profiles.

*   **M-Pesa STK Push Payments:**
    *   Integration with Safaricom's M-Pesa Daraja API for STK Push payments, allowing users to simulate paying for package subscriptions.
    *   Callback handling for payment status updates (though detailed post-payment logic like plan activation is simplified for MVP).

*   **User Dashboard:**
    *   A personalized dashboard for logged-in users.
    *   Displays the user's currently subscribed package details.
    *   Shows simulated internet usage statistics with a visual progress bar.

*   **User Profile Management:**
    *   Users can view and update their own profile information (username, email).
    *   Secure password change functionality, requiring current password verification.

*   **Admin Panel:**
    *   **Role-Based Access Control (RBAC):** Distinct functionalities accessible only to users with an 'admin' role.
    *   **Package Management (CRUD):**
        *   Admins can Create new ISP packages.
        *   Admins can Read (view a list of) all packages.
        *   Admins can Update existing package details.
        *   Admins can Delete packages.
    *   **User Management (CRUD):**
        *   Admins can list all registered users.
        *   Admins can view details of specific users.
        *   Admins can edit user information, including their role (e.g., promote to admin or demote to user).
        *   Admins can delete users, with safeguards (e.g., preventing self-deletion or deletion of the last admin through certain routes).
    *   **Simulated Internet Usage Management:**
        *   Admins can set or update a user's `simulatedDataUsed` (in GB).
        *   Admins can set or update a user's `billingCycleStartDate`.

*   **Internet Speed Test:**
    *   An integrated page allowing authenticated users to test their internet connection speed using an embedded LibreSpeed instance.

*   **Simulated Usage Statistics Display:**
    *   Users can view their `simulatedDataUsed` against their `currentPackage.dataAllowanceNumeric`.
    *   A visual progress bar on the user dashboard indicates the percentage of data allowance consumed.
    *   Handles display for unlimited data plans appropriately.

## Technology Stack

*   **Frontend:**
    *   React (v19 - latest, using Vite for project setup)
    *   React Router DOM (v6+)
    *   Axios (for API communication)
*   **Backend:**
    *   Node.js (Runtime environment)
    *   Express.js (^5.1.0 - as specified in `backend/package.json`)
    *   MongoDB (with Mongoose ORM for object data modeling)
*   **Authentication:**
    *   JSON Web Tokens (JWT)
    *   `bcryptjs` (for secure password hashing)
*   **Database:**
    *   MongoDB (NoSQL database)
    *   MongoDB Atlas is recommended for cloud hosting.
*   **Payment Integration:**
    *   Safaricom Daraja API (for M-Pesa STK Push payments)
*   **Development Tools & Others:**
    *   `npm` (Node Package Manager - for managing project dependencies)
    *   `nodemon` (for automatic backend server restarts during development)
    *   ESLint (JavaScript linter, configured by Vite for the frontend)
    *   `axios` (also used in backend for HTTP calls to Daraja API)
    *   `uuid` (for generating unique IDs in the backend, e.g., for transaction tracking)
    *   `dotenv` (for managing environment variables in the backend)

## Prerequisites for Setup

To set up and run this project locally, you will need the following:

*   **Node.js:**
    *   Version 18.x, 20.x, or 22.x is recommended.
    *   `npm` (Node Package Manager) is included with Node.js. You can download Node.js from [nodejs.org](https://nodejs.org/).
*   **MongoDB:**
    *   A running MongoDB instance. This can be:
        *   A local MongoDB Community Server installation.
        *   OR, a MongoDB Atlas account with a free or paid cluster set up (recommended for ease of use and cloud access).
*   **Git:**
    *   For cloning the repository from its source. Download from [git-scm.com](https://git-scm.com/).
*   **Safaricom Daraja Developer Account (Optional - for M-Pesa Testing):**
    *   This is required if you want to test the M-Pesa payment functionality.
    *   You'll need to register on the [Safaricom Developers Portal](https://developer.safaricom.co.ke/) to get API credentials (Consumer Key, Consumer Secret, Business Shortcode, Passkey).
*   **ngrok (Optional - for M-Pesa Local Callback Testing):**
    *   If you are testing M-Pesa integration on your local machine, `ngrok` or a similar tool is needed to expose your local backend server (specifically the callback endpoint) to the public internet so that Daraja API can send callback notifications. Download from [ngrok.com](https://ngrok.com/).

## Local Development Setup Instructions

1.  **Clone the Repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Create a `.env` file by copying from the example:
        ```bash
        cp .env.example .env
        ```
    *   Update the `.env` file with your specific configurations:
        *   `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/isp_mvp` or your Atlas string).
        *   `JWT_SECRET`: A strong, unique secret key (e.g., generate one using a password manager or online tool).
        *   `PORT` (Optional): Defaults to 5000 if not set, or as specified in `server.js`.
        *   M-Pesa variables (`MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_TRANSACTION_TYPE`, `MPESA_CALLBACK_URL_BASE`, `MPESA_API_ENV`): Fill these in if you plan to test M-Pesa payments. See the "M-Pesa Setup" section below for details.
    *   Install backend dependencies:
        ```bash
        npm install
        ```

3.  **Frontend Setup:**
    *   Navigate to the frontend directory from the project root:
        ```bash
        cd ../frontend 
        ```
        (If you are already in the `backend` directory, use `cd ../frontend`. If you are in the project root, use `cd frontend`.)
    *   Install frontend dependencies:
        ```bash
        npm install
        ```

## Running the Application

1.  **Start the Backend Server:**
    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    *   Run the development server:
        ```bash
        npm run dev
        ```
    *   The server should start (typically on port 5000, or the port specified in your `.env`). Look for console output like "MongoDB Connected..." and "Server running on port XXXX".

2.  **Start the Frontend Development Server:**
    *   Open a **new terminal window or tab** (leave the backend server running in its own terminal).
    *   Navigate to the `frontend` directory:
        ```bash
        cd frontend
        ```
    *   Run the development server:
        ```bash
        npm run dev
        ```
    *   The React development server (Vite) will start, typically on port 5173. Check the console output for the local URL (e.g., `http://localhost:5173`).

3.  **Access the Application:**
    *   Open your web browser and navigate to the frontend URL provided by Vite (e.g., `http://localhost:5173`).

## Key Admin Information

*   **Default Admin Account:**
    *   To create an initial admin user, register a new user with the email: `admin@example.com`. This account will automatically be assigned the 'admin' role due to a temporary seeding mechanism in the registration route.
*   **Accessing Admin Panel:**
    *   Once logged in as an admin, navigation links for "Admin Dashboard", "Manage Packages (Admin)", and "Manage Users" will appear in the main navigation bar.
*   **Admin Capabilities:**
    *   **Package Management:** Create, view, update, and delete ISP packages.
    *   **User Management:** List users, view user details, change user roles (e.g., user to admin), update user information, and delete users.
    *   **Simulated Usage Data:** Set/update simulated internet data usage and billing cycle start dates for users via the user edit page.

## M-Pesa STK Push Setup (Detailed)

This section details the steps required to test the M-Pesa STK Push payment functionality locally using the Daraja Sandbox environment.

1.  **Safaricom Daraja Developer Account:**
    *   Ensure you have an active account on the [Safaricom Daraja Developer Portal](https://developer.safaricom.co.ke/).
    *   Create an application on the portal (e.g., "ISP MVP Test App") to obtain your **Consumer Key** and **Consumer Secret**. These will be used for API authentication.

2.  **Obtain Test Credentials:**
    *   From the Daraja portal, typically under your application's details or a "Test Credentials" section, get your sandbox environment credentials:
        *   **Business Shortcode:** This is your test Till Number or Paybill number (e.g., 174379 for the sandbox Paybill).
        *   **LIPA NA M-PESA Online Passkey:** This is provided by Safaricom for your specific shortcode.
        *   **Transaction Type:** For this application, it's typically "CustomerPayBillOnline". If you were using a Till Number, it might be "CustomerBuyGoodsOnline". This should match the `MPESA_TRANSACTION_TYPE` in your `.env`.

3.  **Configure `backend/.env` File:**
    *   Update your `backend/.env` file with the credentials obtained:
        *   `MPESA_CONSUMER_KEY="YOUR_CONSUMER_KEY_HERE"`
        *   `MPESA_CONSUMER_SECRET="YOUR_CONSUMER_SECRET_HERE"`
        *   `MPESA_SHORTCODE="174379"` (or your specific sandbox shortcode)
        *   `MPESA_PASSKEY="YOUR_LIPA_NA_MPESA_PASSKEY_HERE"`
        *   `MPESA_TRANSACTION_TYPE="CustomerPayBillOnline"` (or as appropriate)
        *   `MPESA_API_ENV="sandbox"` (ensures the application uses Daraja sandbox URLs)

4.  **Expose Local Backend with `ngrok`:**
    *   Download and install [ngrok](https://ngrok.com/download) if you haven't already.
    *   Ensure your local backend server is running (e.g., `npm run dev` in the `backend` directory, typically on port 5000).
    *   In a new terminal window, start `ngrok` to expose your local backend port. If your backend is on port 5000, use:
        ```bash
        ngrok http 5000
        ```
    *   `ngrok` will display a public HTTPS forwarding URL (e.g., `https://xxxx-xx-xxx-xxx.ngrok-free.app` or similar). Note this URL.

5.  **Update `MPESA_CALLBACK_URL_BASE` in `.env`:**
    *   Copy the HTTPS URL provided by `ngrok` (e.g., `https://your-ngrok-assigned-subdomain.ngrok-free.app`). **Do not include any trailing slash.**
    *   Set this as the value for `MPESA_CALLBACK_URL_BASE` in your `backend/.env` file.
        *   Example: `MPESA_CALLBACK_URL_BASE="https://abcdef123456.ngrok-free.app"`
    *   The application internally appends `/api/payments/stk-callback` to this base to form the full callback URL that will be sent to the M-Pesa API during STK Push initiation.

6.  **Register Callback URL on Daraja Portal:**
    *   Log in to the [Safaricom Daraja Developer Portal](https://developer.safaricom.co.ke/).
    *   Navigate to your application.
    *   Find the section for registering or updating URLs (this is often under "APIs" then selecting "LIPA NA M-PESA ONLINE" and looking for "Register URLs" or similar).
    *   You will need to register both a **Confirmation URL** and a **Validation URL**. For sandbox testing with this application, you can use the same full public ngrok callback URL for both:
        *   `https://<your-ngrok-url-from-step-5>/api/payments/stk-callback`
    *   *(Note: While the STK Push API itself takes the callback URL in the request, registering these on the portal is a common requirement for Daraja applications and ensures your app is properly configured to receive callbacks.)*

7.  **Test Phones:**
    *   Ensure you have access to a Kenyan Safaricom test phone number that is registered on the Daraja sandbox. You can find test phone numbers and instructions on how to use them on the Daraja portal (often under "API Explorer" or "Test Credentials" sections).
    *   When initiating a payment from the frontend, you will need to enter this test phone number.

With these steps completed, you should be able to trigger STK Pushes from the application and receive callbacks to your local backend via `ngrok`. Make sure your backend server is running and `ngrok` is active when testing.

## Basic API Endpoint Overview

This section provides a summary of the main backend API route groups. "(user protected)" means the route requires a valid JWT for an authenticated user. "(admin protected)" means the route requires a valid JWT for an authenticated user with an 'admin' role.

*   **Authentication (`/api/auth`)**
    *   `POST /register`: User registration (public).
    *   `POST /login`: User login (public).
    *   `GET /me`: Get logged-in user's profile (user protected).

*   **Packages (`/api/packages`)**
    *   `GET /`: Get all ISP packages (public).
    *   `POST /`: Create a new package (admin protected).
    *   `GET /:id`: Get a single package by ID (public).
    *   `PUT /:id`: Update a package by ID (admin protected).
    *   `DELETE /:id`: Delete a package by ID (admin protected).

*   **User Self-Service (`/api/users/me`)**
    *   `PUT /profile`: Update logged-in user's own profile (username, email) (user protected).
    *   `PUT /password`: Change logged-in user's own password (user protected).

*   **Admin User Management (`/api/admin/users`)**
    *   `GET /`: List all users (admin protected).
    *   `GET /:id`: Get a specific user's details by ID (admin protected).
    *   `PUT /:id`: Update a user's details (e.g., username, email, role) by ID (admin protected).
    *   `DELETE /:id`: Delete a user by ID (admin protected).
    *   `PUT /:userId/usage`: Update a user's simulated usage data (`simulatedDataUsed`, `billingCycleStartDate`) by user ID (admin protected).

*   **Payments (`/api/payments`)**
    *   `POST /initiate-stk`: Initiate an M-Pesa STK push payment for the logged-in user (user protected).
    *   `POST /stk-callback`: Callback URL for M-Pesa to send payment status notifications (publicly accessible, intended for M-Pesa Daraja API).

## Project Structure Overview

```
/mern-isp-management-system  # Root project directory
|
|-- /backend                   # Node.js, Express.js backend
|   |-- /middleware            # (authMiddleware.js, adminMiddleware.js)
|   |-- /models                # Mongoose Schemas (User.js, Package.js, Transaction.js)
|   |-- /routes                # API route definitions (auth.js, packages.js, users.js, adminUsers.js, payments.js)
|   |-- /utils                 # Utility functions (mpesaHelper.js)
|   |-- .env                   # (Actual environment variables - DO NOT COMMIT)
|   |-- .env.example           # Template for environment variables
|   |-- .gitignore             # Specifies intentionally untracked files for Git
|   |-- server.js              # Main backend server file (Express app setup, DB connection)
|   |-- package.json           # Backend dependencies and scripts
|   |-- package-lock.json
|
|-- /frontend                  # React (Vite) frontend
|   |-- /public                # Static assets (e.g., favicons, robots.txt)
|   |-- /src                   # Main source code directory for the React app
|   |   |-- /assets            # Static assets like images, logos used by components
|   |   |-- /components        # Reusable UI components
|   |   |   |-- /Auth          # (Register.js, Login.js)
|   |   |   |-- /Admin         # (PackageForm.js, UserEditForm.js)
|   |   |   |-- /Dashboard     # (DashboardPage.js - though this is a page, could also be here if parts are components)
|   |   |   |-- /Packages      # (PackageList.js - though this is a page, could also be here if parts are components)
|   |   |   |-- /Routing       # (AdminRoute.js)
|   |   |-- /context           # React Context API (AuthContext.js)
|   |   |-- /pages             # Page-level components
|   |   |   |-- /Admin         # (AdminDashboardPage.js, AdminPackageListPage.js, AdminPackageFormPage.js, AdminUserListPage.js, AdminEditUserPage.js)
|   |   |   |-- NotAuthorizedPage.js
|   |   |   |-- SpeedTestPage.js
|   |   |   |-- UserProfilePage.js
|   |   |-- App.jsx            # Main React app component, defines routes
|   |   |-- index.css          # Global styles (or App.css if used)
|   |   |-- main.jsx           # Entry point for the React application (renders App.jsx)
|   |-- .gitignore             # Specifies intentionally untracked files for Git
|   |-- index.html             # Main HTML template for Vite
|   |-- package.json           # Frontend dependencies and scripts
|   |-- package-lock.json
|   |-- vite.config.js         # Vite build tool configuration
|
|-- README.md                  # This file (the main project README)
```
