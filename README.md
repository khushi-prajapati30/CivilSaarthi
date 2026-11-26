# Smart Civic Issue Management System

A full-stack MERN web application with automated duplicate detection, priority calculation, and department assignment for civic issue management.

## Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, React Router DOM, Axios, Recharts, React Leaflet.
* **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Auth, Multer (Image Upload).

## Features
1. **User Authentication:** JWT-based login/registration with User and Admin roles.
2. **Issue Reporting:** Upload images, select categories, and pinpoint locations on an interactive Leaflet Map.
3. **Smart Duplicate Detection:** Uses the Haversine formula to detect if similar complaints (within 50 meters) have already been reported. If so, it increments the `reportsCount` instead of creating a duplicate.
4. **Automated Prioritization:** Automatically calculates priority (Low, Medium, High, Critical) based on the number of reports.
5. **Department Mapping:** Automatically assigns complaints to relevant departments (e.g., Road, Sanitation, Water, Electricity).
6. **Admin Dashboard & Analytics:** Admins can manage the status of complaints and view system analytics visually with Recharts.

---

## Step-by-Step Local Setup

### 1. Prerequisites
Make sure you have Node.js installed.
Ensure you have MongoDB running locally OR get a MongoDB Atlas connection string.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd SMART_COMPLAINT_SYSTEM/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```
   *(Note: The `server.js` automatically creates an `uploads/` folder and connects to `mongodb://localhost:27017/smart_complaint_system` based on `.env`)*

### 3. Frontend Setup
1. Open a NEW terminal window and navigate to the frontend folder:
   ```bash
   cd SMART_COMPLAINT_SYSTEM/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the displayed local link (usually `http://localhost:5173`) in your browser.

---

## API Testing Guide

### 1. Register a User (or Admin)
You can test registration directly from the Frontend UI or via Postman:
**POST** `http://localhost:5000/api/auth/register`
Body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
*To make a user an Admin, you will currently need to manually edit their document in MongoDB to change `"role": "user"` to `"role": "admin"`, or update the registration endpoint temporarily for testing.*

### 2. Login
**POST** `http://localhost:5000/api/auth/login`
Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Report an Issue
You must pass the token received from login in the `Authorization` header as `Bearer <token>`.
**POST** `http://localhost:5000/api/issues`
Body (form-data):
* title: "Huge Pothole"
* description: "Damaging cars"
* category: "Pothole"
* latitude: 20.5937
* longitude: 78.9629
* image: [File attachment]

---

## Deployment Steps

### Backend Deployment (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com/) and create a "New Web Service".
3. Connect your GitHub repository and select the `backend` folder as the root directory.
4. Set the build command to `npm install` and start command to `node server.js`.
5. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `PORT`).
6. Deploy.
*(Note: For a production app, you should replace the local Multer storage with Cloudinary or AWS S3 for persistent image storage).*

### Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/) and click "Add New Project".
2. Import your GitHub repository.
3. Select the `frontend` folder as the Root Directory.
4. Vercel automatically detects Vite. Build command: `npm run build`, Output directory: `dist`.
5. Add any environment variables (e.g., `VITE_API_URL` pointing to your Render backend link).
6. Click Deploy.
