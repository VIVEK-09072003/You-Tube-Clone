class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.message = message;
        this.success = false;

        // If a custom stack trace is provided, use it, else capture the stack trace
        if (stack) {
            this.stack = stack;
        } else {
            // Fix the issue here by using Error.captureStackTrace
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }
}

export { ApiError };
