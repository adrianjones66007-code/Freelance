# Backend Setup Guide

## Requirements

- Node.js v14+
- npm or yarn
- MongoDB (local or cloud)
- Postman or similar tool for testing APIs

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages:

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freelance_marketplace
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/freelance_marketplace?retryWrites=true&w=majority
```

### 3. Setup MongoDB

**Local MongoDB:**

```bash
# Windows: Install MongoDB and run
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

**MongoDB Atlas (Cloud):**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string and add to `.env`

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Auth Routes (`/api/auth`)

**Register:**

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "client"
}

Response: { token, user: { id, name, email, userType } }
```

**Login:**

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user: {...} }
```

**Get Current User:**

```
GET /api/auth/me
Authorization: Bearer {token}

Response: { _id, name, email, userType, profile, ... }
```

### Users Routes (`/api/users`)

**Get All Freelancers:**

```
GET /api/users

Response: [{ _id, name, profile, averageRating, ... }]
```

**Get User Profile:**

```
GET /api/users/{userId}

Response: { _id, name, email, profile, averageRating, ... }
```

**Update User Profile:**

```
PUT /api/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Experienced developer",
  "skills": ["React", "Node.js", "MongoDB"],
  "hourlyRate": 50
}

Response: { message, user: {...} }
```

### Projects Routes (`/api/projects`)

**Get All Projects:**

```
GET /api/projects?category=Web Development&minBudget=1000&maxBudget=5000

Response: [{ _id, title, description, budget, category, status, client, bids, ... }]
```

**Create Project:**

```
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Build E-commerce Website",
  "description": "Need a modern e-commerce site with React and Node.js",
  "category": "Web Development",
  "budget": 3000,
  "budgetType": "fixed",
  "skills": ["React", "Node.js", "MongoDB"],
  "deadline": "2024-04-30"
}

Response: { _id, title, ...project data... }
```

### Bids Routes (`/api/bids`)

**Submit Bid:**

```
POST /api/bids
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "{projectId}",
  "bidAmount": 2500,
  "proposedTimeline": "2 weeks",
  "coverLetter": "I have 5 years of experience in web development..."
}

Response: { _id, freelancer, project, bidAmount, status, ... }
```

**Get Project Bids:**

```
GET /api/bids/project/{projectId}
Authorization: Bearer {token}

Response: [{ _id, freelancer, bidAmount, status, ... }]
```

**Accept Bid:**

```
PUT /api/bids/{bidId}/accept
Authorization: Bearer {token}

Response: { status: "accepted", ...bid data... }
```

### Messages Routes (`/api/messages`)

**Send Message:**

```
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiver": "{receiverId}",
  "projectId": "{projectId}",
  "message": "Hey, interested in discussing the project details!"
}

Response: { _id, sender, receiver, message, isRead, createdAt }
```

**Get Conversation:**

```
GET /api/messages/conversation/{userId}
Authorization: Bearer {token}

Response: [{ messages between current user and userId }]
```

### Reviews Routes (`/api/reviews`)

**Create Review:**

```
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "reviewedUserId": "{userId}",
  "projectId": "{projectId}",
  "rating": 5,
  "comment": "Excellent work! Would hire again."
}

Response: { _id, reviewer, reviewed, rating, comment, ... }
```

**Get User Reviews:**

```
GET /api/reviews/user/{userId}

Response: [{ _id, reviewer, rating, comment, ... }]
```

## Project Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  userType: String (client, freelancer, both),
  profile: {
    bio: String,
    profileImage: String,
    skills: [String],
    hourlyRate: Number,
    completedProjects: Number
  },
  averageRating: Number (1-5),
  totalReviews: Number,
  isVerified: Boolean,
  createdAt: Date
}
```

### Project Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  category: String,
  budget: Number (required),
  budgetType: String (fixed, hourly),
  client: ObjectId (ref: User),
  assignedFreelancer: ObjectId (ref: User),
  skills: [String],
  status: String (open, in-progress, completed, cancelled),
  deadline: Date,
  bids: [ObjectId] (ref: Bid),
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Bid Schema

```javascript
{
  _id: ObjectId,
  freelancer: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  bidAmount: Number (required),
  proposedTimeline: String,
  coverLetter: String (required),
  status: String (pending, accepted, rejected, withdrawn),
  createdAt: Date
}
```

## Testing the API

### Using Postman

1. Import the API collection (create one with the endpoints above)
2. Set environment variables:
   - `base_url`: http://localhost:5000
   - `token`: Your JWT token (get from login response)
3. Create a new request for each endpoint
4. Test the flow: Register → Login → Create Project → Submit Bid

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"test123","userType":"client"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Get user (use token from login response)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Server Error

Error responses:

```json
{
  "message": "Error description here"
}
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed

- Check MongoDB is running
- Verify connection string in `.env`
- For Atlas: whitelist your IP address

### JWT Errors

- Ensure JWT_SECRET is set in `.env`
- Check token format: `Bearer {token}`
- Token may have expired

## Performance Tips

1. Add database indexes on frequently searched fields
2. Implement caching for large queries
3. Use pagination for results
4. Add request throttling/rate limiting
5. Monitor database performance

## Security Considerations

1. Change JWT_SECRET in production
2. Use HTTPS in production
3. Add input validation
4. Implement rate limiting
5. Add CSRF protection
6. Store sensitive data securely
7. Use environment variables for secrets
