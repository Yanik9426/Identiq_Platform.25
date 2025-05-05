import { Request, Response, NextFunction } from 'express'; // Assuming you use the Express framework
import { logAuditEvent } from '../services/auditService'; // Import the audit logging function

// Define the middleware function
export function apiLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
    // Record the time the request started
    const start = Date.now();
    // Try to get the user ID from the request object.
    // This assumes you have *other* middleware running *before* this one
    // that verifies the user and attaches their info (like ID) to 'req.user'.
    // If no user is logged in, use 'anonymous'.
    const userId = (req as any).user?.id || 'anonymous'; // Use 'any' for now if req.user isn't typed

    // Log that the API call was initiated
    logAuditEvent(
        userId, // Who is making the call (or anonymous)
        'api_call_initiated', // The action being logged
        { type: 'apiEndpoint', id: req.path }, // What is being called (the URL path)
        { method: req.method, ip: req.ip } // Extra details: HTTP method (GET, POST) and IP address
    ).catch(err => console.error("Audit logging failed for api_call_initiated:", err)); // Log errors during logging itself

    // 'res.on('finish', ...)' sets up an action to run *after* the response has been sent
    res.on('finish', () => {
        // Calculate how long the request took
        const duration = Date.now() - start;
        // Get the HTTP status code of the response (e.g., 200 for OK, 404 for Not Found, 500 for error)
        const status = res.statusCode;
        // Determine if it was a success (status below 400) or failure (status 400 or above)
        const eventType = status >= 400 ? 'api_call_failure' : 'api_call_success';

        // Log the completion event (success or failure)
        logAuditEvent(
            userId, // Who made the call
            eventType, // The action (api_call_success or api_call_failure)
            { type: 'apiEndpoint', id: req.path }, // What was called
            { method: req.method, statusCode: status, durationMs: duration } // Extra details: method, status code, time taken
        ).catch(err => console.error(`Audit logging failed for ${eventType}:`, err)); // Log errors during logging itself
    });

    // 'next()' passes control to the *next* middleware function or the actual route handler
    // If you forget this, the request will hang and never complete!
    next();
}
