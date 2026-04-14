# Frontend Setup Guide

## Requirements

- Node.js v14+
- npm or yarn
- Modern web browser

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages:

- `react` - UI library
- `react-dom` - React rendering
- `axios` - HTTP client
- `react-scripts` - Build scripts

### 2. Configure Backend URL

The frontend is configured to proxy requests to `http://localhost:5000` by default (see `package.json` proxy setting).

If your backend is on a different URL, modify the requests in components:

```javascript
// In any component
axios.get("http://your-backend-url/api/...");
```

### 3. Start Development Server

```bash
npm start
```

This opens the application at `http://localhost:3000` with hot-reload enabled.

### 4. Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navigation.js    # Header & Footer
│   ├── ProjectComponents.js  # Project cards and forms
│   ├── BidComponents.js     # Bid cards and forms
│   ├── MessageComponents.js # Messaging UI
│   └── ReviewComponents.js  # Review display and forms
│
├── pages/               # Page components
│   ├── Home.js         # Browse projects
│   ├── Login.js        # Login page
│   ├── Register.js     # Sign up page
│   ├── Dashboard.js    # User dashboard
│   ├── PostProject.js  # Create project
│   ├── ProjectDetails.js # Project page
│   ├── Profile.js      # User profile
│   ├── FreelancerList.js # Browse freelancers
│   └── Messages.js     # Messaging page
│
├── context/            # React Context
│   └── AuthContext.js  # Authentication state
│
├── App.js             # Main app component
├── index.js           # Entry point
└── index.css          # Global styles
```

## Key Features and Usage

### Authentication Context

Located in `src/context/AuthContext.js`, handles:

- User registration and login
- Token management (localStorage)
- Auth state across app

```javascript
import { AuthContext } from "./context/AuthContext";

const { user, token, login, logout } = useContext(AuthContext);
```

### Making API Requests

The app uses Axios for HTTP requests:

```javascript
import axios from "axios";

// GET request
const response = await axios.get("/api/projects");

// POST with authentication
await axios.post("/api/projects", projectData, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Navigation

Simple hash-based navigation:

```javascript
// Navigate to page
navigate("/project/123");
navigate("/freelancers");

// With parameters
navigate("/profile", { id: userId });
```

## Component Documentation

### Navigation Components

**Navbar** - Top navigation bar

```jsx
<Navbar user={user} onLogout={handleLogout} />
```

**Footer** - Bottom footer

```jsx
<Footer />
```

### Project Components

**ProjectCard** - Display project summary

```jsx
<ProjectCard project={project} onViewDetails={handleViewDetails} />
```

**ProjectForm** - Create/edit project

```jsx
<ProjectForm onSubmit={handleSubmit} initialData={project} />
```

### Bid Components

**BidCard** - Display bid information

```jsx
<BidCard
  bid={bid}
  onAccept={handleAccept}
  onReject={handleReject}
  isClient={true}
/>
```

**BidForm** - Submit a bid

```jsx
<BidForm projectId={projectId} onSubmit={handleSubmit} />
```

### Review Components

**ReviewCard** - Display review

```jsx
<ReviewCard review={review} />
```

**ReviewForm** - Write a review

```jsx
<ReviewForm onSubmit={handleSubmit} />
```

**RatingDisplay** - Show rating with stars

```jsx
<RatingDisplay rating={4.5} count={12} />
```

### Message Components

**MessageBox** - Chat interface

```jsx
<MessageBox
  messages={messages}
  onSendMessage={handleSend}
  currentUserId={userId}
/>
```

**ConversationList** - List of conversations

```jsx
<ConversationList conversations={convs} onSelectConversation={handleSelect} />
```

## Styling

Global styles are in `src/index.css`. Color scheme:

- Primary: `#667eea` (Purple-blue)
- Secondary: `#764ba2` (Dark purple)
- Background: `#f5f5f5` (Light gray)

### Color Variables (add to CSS)

```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
  --light: #f5f5f5;
  --dark: #333;
}
```

### Common Classes

```css
.btn              /* Button styling */
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.card             /* Card container */
.grid             /* Grid layout */
.badge            /* Tag/badge */
.hero             /* Hero section */
.container        /* Max-width container */
```

## Pages Workflow

### Home Page

1. Displays all open projects
2. Filter by category and budget
3. Click project to view details

### Login/Register

1. Form validation
2. Token stored in localStorage
3. Redirects to dashboard on success

### Dashboard

- **Clients:** View their projects, post new projects
- **Freelancers:** View their bids, track status

### Project Details

1. Show full project information
2. Display all bids (if authorized)
3. Submit bid option (for freelancers)
4. Accept/reject bids (for clients)

### Profile

1. View user information
2. Edit own profile
3. View reviews/ratings
4. Write reviews (if authorized)

### Messages

1. List conversations
2. Send/receive messages in real-time
3. Mark messages as read

### Post Project

1. Form to create new project
2. Add skills, budget, deadline
3. Redirect to dashboard after posting

## Common Issues and Solutions

### CORS Errors

If you get CORS errors, check:

1. Backend has CORS enabled
2. Frontend proxy is correctly set in `package.json`
3. Request URL matches backend URL

### Authentication Issues

```javascript
// Clear stored data
localStorage.clear();
// Then login again
```

### Blank Page

1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check MongoDB connection

### Styling Issues

1. Clear browser cache
2. Restart dev server
3. Check CSS file is imported in `index.css`

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### GitHub Pages

```bash
# Add to package.json
"homepage": "https://yourusername.github.io/freelance-marketplace"

# Build and deploy
npm run build
npm install gh-pages --save-dev
# Add deploy scripts to package.json
```

## Environment Variables

Create `.env` file in frontend root (optional):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

Use in code:

```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

## Performance Optimization

1. **Code Splitting** - Use React.lazy() for pages
2. **Memoization** - Use React.memo() for components
3. **Image Optimization** - Compress images
4. **Bundle Analysis** - `npm install -g webpack-bundle-analyzer`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Testing

Add tests (optional):

```bash
npm test
```

Example test:

```javascript
import { render, screen } from "@testing-library/react";
import Home from "./pages/Home";

test("renders home page", () => {
  render(<Home navigate={() => {}} />);
  expect(screen.getByText(/Find Your Next Project/i)).toBeInTheDocument();
});
```

## Debugging

1. **React DevTools** - Browser extension for React debugging
2. **Network Tab** - Inspect API requests
3. **Console** - JavaScript errors and logging
4. **Breakpoints** - Add `debugger;` in code

## Advanced Customization

### Add New Page

1. Create `src/pages/NewPage.js`
2. Add to App.js switch statement
3. Import navigation components

### Add New API Endpoint

1. Create route in backend
2. Add axios call in component
3. Handle response and errors

### Modify Colors

Edit `src/index.css`:

```css
.btn-primary {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR2 100%);
}
```
