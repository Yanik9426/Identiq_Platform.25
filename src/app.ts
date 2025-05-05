import express from 'express';
// ... other existing imports like cors, body-parser, etc. ...
import { apiLoggingMiddleware } from './middleware/loggingMiddleware'; // <-- Import the logging middleware
import { globalErrorHandler } from './middleware/errorHandlingMiddleware'; // <-- Import the error handling middleware
// ... imports for your API routes (e.g., import userRoutes from './routes/userRoutes') ...

const app = express();
const port = process.env.PORT || 3000; // Example port

// --- Existing Middleware Setup ---
// Examples: (Your actual setup might differ)
// app.use(cors()); // Enable Cross-Origin Resource Sharing
// app.use(express.json()); // Parse JSON request bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Add API Logging Middleware ---
// Place this *after* basic setup (like JSON parsing) but *before* your API routes.
app.use(apiLoggingMiddleware); // <-- Add this line

// --- Authentication Middleware (Example - you might have this already) ---
// app.use(authenticationMiddleware); // Middleware that verifies users and adds req.user

// --- API Routes ---
// Mount your different API route handlers here
// Example: app.use('/api/users', userRoutes);
// Example: app.use('/api/candidates', candidateRoutes);
// Example: app.use('/api/companies', companyRoutes);
// ... other routes ...

// --- Add Global Error Handling Middleware ---
// This MUST come *after* all your routes and other middleware.
app.use(globalErrorHandler); // <-- Add this line

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// You might also export the app for testing purposes
// export default app; 