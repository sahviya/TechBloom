import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://mindbloomgenie.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Basic routes for testing
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Authentication routes
app.get('/api/auth/user', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    token: 'test-token',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    }
  });
});

// Configure serverless handler
const handler = serverless(app, {
  basePath: '/.netlify/functions/server'
});

export { handler };