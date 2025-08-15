const express = require('express');
const app = express();
require('dotenv/config');
const cors = require('cors');
const mongoose = require('mongoose');

app.use(cors());

//middlewares
app.use(express.json());

//Routers
const usersRoutes = require('./routers/users');
const flashcardsRoutes = require('./routers/flashcards');

const api = process.env.API_URL

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/flashcards`, flashcardsRoutes);

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