# MechMate - AI Powered Roadside Vehicle Breakdown Assistance System

A MERN stack application that connects customers with verified roadside assistance mechanics using location-based matching, AI-assisted issue assessment, and request/booking workflows.

## Features

### For Customers
- **Emergency Assistance**: Submit vehicle breakdown requests with location tracking
- **Location-Based Matching**: Share location and find nearby verified mechanics with estimated arrival information
- **Scheduled Bookings**: Book mechanics for scheduled services and inspections
- **Vehicle Management**: Register and manage multiple vehicles
- **Reviews & Ratings**: Rate and review mechanics based on service quality
- **Status Notifications**: Receive notifications when request status changes

### For Mechanics
- **Request Management**: View and accept nearby breakdown requests
- **Job Tracking**: Manage active and completed jobs
- **Schedule Management**: Handle scheduled service bookings
- **Reputation Building**: Build profile through customer reviews and ratings
- **Availability Control**: Set availability status to receive requests

### For Admins
- **User Management**: Manage all users (customers, mechanics, admins)
- **Mechanic Approval**: Approve mechanic registrations
- **Request Monitoring**: Monitor all breakdown requests
- **Booking Oversight**: View and manage all bookings
- **Dashboard Monitoring**: View users, requests, and bookings from the admin dashboard

## Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **Bootstrap 5** - CSS framework
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## Project Structure

```
mechmate/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── requestController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── upload.js          # File upload handling
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Request.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── requests.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── notifications.js
│   ├── uploads/               # File upload directory
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Reviews.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── AdminRequests.jsx
│   │   │   │   └── AdminBookings.jsx
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboard.jsx
│   │   │   │   ├── CustomerRequest.jsx
│   │   │   │   ├── CustomerRequests.jsx
│   │   │   │   └── CustomerBookings.jsx
│   │   │   └── mechanic/
│   │   │       ├── MechanicDashboard.jsx
│   │   │       ├── MechanicRequests.jsx
│   │   │       ├── MechanicJobs.jsx
│   │   │       └── MechanicBookings.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── requestService.js
│   │   │   ├── bookingService.js
│   │   │   ├── reviewService.js
│   │   │   └── userService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mechmate
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
copy .env.example .env
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Demo Accounts

Use these accounts for local demonstration after running the demo account setup script (`node backend/demoAccounts.js`):

| Role | Email | Password |
|---|---|---|
| Customer | `demo.customer@mechmate.com` | `Demo@123` |
| Mechanic | `testmechanic@mechmate.com` | `Demo@123` |
| Admin | `admin@mechmate.com` | `Demo@123` |

Mechanic demo profile: verified, available, engine/electrical/battery specialization, 7 years experience, 4.6 rating, 18 reviews, ₹800/hour.

## Usage

### Creating an Admin Account

1. Register a new account at `/register`
2. Manually update the user role in MongoDB to 'admin':
```javascript
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})
```

### Customer Workflow

1. Register as a customer
2. Add vehicle information in profile
3. Submit breakdown requests with location
4. Monitor request status and estimated arrival information
5. Rate and review mechanic after service

### Mechanic Workflow

1. Register as a mechanic
2. Wait for admin approval
3. Set availability status
4. View and accept nearby requests
5. Update job status as work progresses
6. Build reputation through reviews

### Admin Workflow

1. Login with admin credentials
2. Approve pending mechanic registrations
3. Monitor platform activity
4. Manage users and resolve issues
5. Review users, requests, and bookings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/mechanics/recommend` - Get dynamically ranked mechanic recommendations
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Update password
- `POST /api/users/vehicles` - Add vehicle
- `GET /api/users/mechanics` - Get all mechanics
- `GET /api/users/mechanics/nearby` - Get nearby mechanics
- `PUT /api/users/mechanics/:id/approve` - Approve mechanic (admin)
- `GET /api/users` - Get all users (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### AI Assessment
- `POST /api/ai/diagnose` - Analyze a breakdown description and return an AI-assisted assessment

### Requests
- `POST /api/requests` - Create breakdown request
- `GET /api/requests` - Get user's requests
- `GET /api/requests/available` - Get available requests (mechanic)
- `GET /api/requests/all` - Get all requests (admin)
- `GET /api/requests/:id` - Get request by ID
- `PUT /api/requests/:id/accept` - Accept request (mechanic)
- `PUT /api/requests/:id/status` - Update request status
- `PUT /api/requests/:id/cancel` - Cancel request

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/all` - Get all bookings (admin)
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get reviews
- `GET /api/reviews/all` - Get all reviews (admin)
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id/respond` - Respond to review (mechanic)
- `DELETE /api/reviews/:id` - Delete review (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Features in Detail

### Role-Based Access Control
- **Admin**: Full system access, user management, approval workflows
- **Mechanic**: Request management, job tracking, booking handling
- **Customer**: Request submission, booking creation, review submission

### Location & Notification Features
- Location-based mechanic matching
- Dynamic mechanic recommendation using distance, specialization, rating, and experience
- Request status notifications
- Estimated arrival calculation

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based route protection
- CORS configuration
- Input validation

## Development

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
```

### Environment Variables

Make sure to set the following environment variables:

**Backend (.env)**:
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `GEMINI_API_KEY` - Google Gemini API key used for AI-assisted issue assessment
- `FRONTEND_URL` - Frontend URL for CORS

**Frontend (.env)**:
- `VITE_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@mechmate.com or create an issue in the repository.

## Future Enhancements

- Payment gateway integration
- Advanced analytics dashboard
- Mobile app development
- Route optimization for mechanics
- Multi-language support
- Dark mode UI
