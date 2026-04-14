# Freelance Marketplace

A full-featured freelance marketplace platform where clients can post jobs and freelancers can bid on projects.

## Features

✅ **User Authentication** - Secure JWT-based authentication
✅ **Browse Projects** - Clients can list and filter projects
✅ **Browse Freelancers** - Find and hire talented freelancers
✅ **Bidding System** - Freelancers can submit bids for projects
✅ **Messaging** - Direct communication between clients and freelancers
✅ **Reviews & Ratings** - Rate and review completed work
✅ **User Profiles** - Showcase skills, experience, and ratings
✅ **Project Management** - Track project status and assignments

## Project Structure

```
freelance-marketplace/
├── backend/                    # Node.js/Express server
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── middleware/            # Middleware functions
│   ├── server.js              # Server entry point
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend/                  # React application
│   ├── public/
│   │   └── index.html        # Main HTML file
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context (Auth)
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Styles
│   └── package.json
│
└── README.md                 # This file
```

## Technology Stack

**Backend:**

- Node.js & Express.js
- MongoDB
- JWT for authentication
- Stripe (for payments - ready to integrate)

**Frontend:**

- React
- Axios (HTTP client)
- CSS3 (modern styling)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas account)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create/update `.env` file with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freelance_marketplace
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the backend server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users

- `GET /api/users` - Get all freelancers
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (requires auth)

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)

### Bids

- `POST /api/bids` - Submit bid (requires auth)
- `GET /api/bids/project/:projectId` - Get project bids
- `GET /api/bids/freelancer/bids/:freelancerId` - Get freelancer bids
- `PUT /api/bids/:bidId/accept` - Accept bid (requires auth)
- `PUT /api/bids/:bidId/reject` - Reject bid (requires auth)

### Messages

- `POST /api/messages` - Send message (requires auth)
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/inbox/:userId` - Get user inbox
- `PUT /api/messages/:messageId/read` - Mark message as read

### Reviews

- `POST /api/reviews` - Create review (requires auth)
- `GET /api/reviews/user/:userId` - Get user reviews

## Usage

### For Clients

1. Sign up and select "Client" as your user type
2. Login to your dashboard
3. Click "Post a Project" to create a new project
4. Fill in project details, budget, and required skills
5. Browse incoming bids from freelancers
6. Accept the best bid to assign the project
7. Message freelancers to discuss project details
8. Leave a review after project completion

### For Freelancers

1. Sign up and select "Freelancer" as your user type
2. Complete your profile with skills and experience
3. Browse available projects
4. Submit bids on projects matching your skills
5. Communicate with clients through messaging
6. Once project is assigned, start working
7. Deliver work and receive reviews

## Features in Detail

### Authentication

- Secure registration and login with email
- JWT token-based authentication
- User types: Client, Freelancer, or Both
- Protected routes for authenticated users

### Project Management

- Create, edit, and delete projects
- Filter projects by category, budget, and skills
- Track project status (Open, In-Progress, Completed, Cancelled)
- Set project deadlines and budgets
- Choose between fixed and hourly pricing

### Bidding System

- Freelancers can submit multiple bids per project
- Include cover letter and proposed timeline
- Clients can accept or reject bids
- Track bid status (Pending, Accepted, Rejected)

### Messaging

- Real-time direct messaging between users
- Message history and conversations
- Mark messages as read
- Project-specific messaging

### Reviews & Ratings

- Rate completed projects on 1-5 star scale
- Leave detailed comments
- Aggregate ratings on user profiles
- Total review count displayed

### User Profiles

- Display name, bio, skills, and hourly rate
- Profile picture support
- Track completed projects
- View average rating

## Customization

### Adding Payment Integration

Replace the Stripe placeholder in `.env` with your actual API key and integrate the Stripe SDK for handling payments.

### Modifying Styles

Edit `frontend/src/index.css` to customize colors, fonts, and layout:

- Primary color: `#667eea`
- Secondary color: `#764ba2`

### Database Configuration

Change MongoDB connection string in `.env` to use MongoDB Atlas or a different MongoDB instance.

## Deployment

### Backend Deployment (Heroku)

1. Create a Heroku account and install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set KEY=value`
5. Deploy: `git push heroku main`

### Frontend Deployment (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Set environment variables to point to production API

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify network access if using MongoDB Atlas

### CORS Errors

- Backend should have CORS enabled (already configured)
- Check frontend API endpoint matches backend URL

### Authentication Issues

- Clear browser localStorage: `localStorage.clear()`
- Check JWT_SECRET matches between sessions
- Verify token expiration in `.env`

## Future Enhancements

- [ ] Payment integration with Stripe
- [ ] Search and recommendations algorithm
- [ ] Advanced filtering and sorting
- [ ] Portfolio showcase for freelancers
- [ ] Time tracking during projects
- [ ] Dispute resolution system
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Video call integration

## Contributing

Feel free to fork this project and submit pull requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue in the repository or contact support.

---

**Happy freelancing!** 🚀
