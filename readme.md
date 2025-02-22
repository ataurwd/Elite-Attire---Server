# Ema Job Assignment - Backend

This is the backend of the **Ema Job Assignment** website, built using **Node.js, Express.js, and MongoDB**.

## 🚀 Features
- User authentication with JWT
- Job listing and management
- Secure API routes
- MongoDB database integration
- Nodemailer for email notifications

## 🛠️ Tech Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email notifications

## 📦 Installation
1. Clone the repository:
   ```bash
   git clone <backend-repo-url>
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and add the following:
   ```env
   PORT=5000
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-secret-key>
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-email-password>
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints
| Method | Endpoint       | Description         |
|--------|---------------|---------------------|
| GET    | `/jobs`       | Get all job posts  |
| POST   | `/jobs`       | Create a job post  |
| GET    | `/users`      | Get user data      |
| POST   | `/auth/login` | Authenticate user  |

## 🚀 Deployment
This project is deployed on **Render/Vercel**. To deploy:
```bash
npm run build
```

## 📜 License
This project is licensed under the MIT License.
