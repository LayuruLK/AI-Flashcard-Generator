const express = require('express');
const app = express();
require('dotenv/config');
const cors = require('cors');
const mongoose = require('mongoose');

const passport = require('passport');
require('./config/passport'); // For JWT strategy
require('./config/googleStrategy')(); // For Google strategy

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};


app.use(cors());
app.use(passport.initialize());
app.use(cors(corsOptions));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type']
}));

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routers
const usersRoutes = require('./routers/users');
const flashcardsRoutes = require('./routers/flashcards');
const flashcardhistoryRoutes = require('./routers/flashcardhistory');

const api = process.env.API_URL

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/flashcards`, flashcardsRoutes);
app.use(`${api}/flashcardshistory`, flashcardhistoryRoutes);

// Check for required environment variables
if (!process.env.CONNECTION_STRING || !process.env.PORT) {
    console.error("ERROR: Missing environment variables. Ensure CONNECTION_STRING and PORT are set.");
    process.exit(1);
}

// Database Connection
mongoose
    .connect(process.env.CONNECTION_STRING, { dbName: 'flashDB' })
    .then(() => {
        console.log('Database Connection is ready...');
    })
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1); // Terminate if the database connection fails
    });

// Set up the server
const port = process.env.PORT || 3000; // Default to port 3000 if PORT is undefined
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});