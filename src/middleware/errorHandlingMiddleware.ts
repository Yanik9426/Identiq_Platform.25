import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'; // Assuming Express
import { logAuditEvent } from '../services/auditService'; // Import the audit logging function

// Define the global error handling middleware.
// Note the special signature with 'err' as the first parameter - Express recognizes this.
export const globalErrorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    // Log the full error details to the server console for developers to see
    console.error("Unhandled Exception Caught by Global Handler:", err);

    // Try to get the user ID from the request, default to 'system' if unavailable or irrelevant
    const userId = (req as any).user?.id || 'system'; // Use 'any' if req.user isn't typed

    // Log the critical event for audit purposes
    logAuditEvent(
        userId, // Who encountered the error (or system)
        'unhandled_exception', // The specific action: an unexpected error
        { type: 'system', id: 'globalError' }, // Target is the system itself
        {
            error: err.message, // The error message
            path: req.path, // The URL path where the error occurred
            method: req.method, // The HTTP method (GET, POST, etc.)
            // Avoid logging the full technical 'stack trace' in the audit log for security/cleanliness,
            // but it's logged to the console above for debugging.
            // stack: err.stack
        }
    ).catch(logError => console.error("Failed to log unhandled exception to audit log:", logError)); // Catch errors during logging

    // Always send a generic, user-friendly error message back to the client.
    // Avoid sending technical error details to the end-user for security reasons.
    // Only send a 500 status code if a response hasn't already been partially sent.
    if (!res.headersSent) {
        res.status(500).json({ message: 'An unexpected internal server error occurred. Please try again later.' });
    } else {
        // If headers were already sent, we can't set a new status code or JSON body.
        // We just end the response. The browser might show an incomplete response error.
        res.end();
    }
};
