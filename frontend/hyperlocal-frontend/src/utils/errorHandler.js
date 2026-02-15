/**
 * Error Handling Utilities
 * Centralized error handling for consistent error management across the application
 */

import { HTTP_STATUS, ERROR_CODES } from '../constants';

/**
 * Custom Application Error class
 */
export class AppError extends Error {
    constructor(message, code = ERROR_CODES.UNKNOWN_ERROR, statusCode = 500) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
        };
    }
}

/**
 * Handle API errors and convert to AppError
 * @param {Error} error - The error object from axios or fetch
 * @returns {AppError} - Standardized AppError instance
 */
export const handleApiError = (error) => {
    // Handle axios response errors
    if (error.response) {
        const { status, data } = error.response;

        switch (status) {
            case HTTP_STATUS.UNAUTHORIZED:
                return new AppError(
                    data?.message || 'Please log in to continue',
                    ERROR_CODES.UNAUTHORIZED,
                    status
                );

            case HTTP_STATUS.FORBIDDEN:
                return new AppError(
                    data?.message || 'You do not have permission to access this resource',
                    ERROR_CODES.FORBIDDEN,
                    status
                );

            case HTTP_STATUS.NOT_FOUND:
                return new AppError(
                    data?.message || 'The requested resource was not found',
                    ERROR_CODES.NOT_FOUND,
                    status
                );

            case HTTP_STATUS.UNPROCESSABLE_ENTITY:
                return new AppError(
                    data?.message || 'Validation failed. Please check your input.',
                    ERROR_CODES.VALIDATION_ERROR,
                    status
                );

            case HTTP_STATUS.BAD_REQUEST:
                return new AppError(
                    data?.message || 'Invalid request. Please check your input.',
                    ERROR_CODES.VALIDATION_ERROR,
                    status
                );

            default:
                return new AppError(
                    import.meta.env.PROD
                        ? 'Something went wrong. Please try again.'
                        : (data?.message || data?.error || 'Server error occurred'),
                    ERROR_CODES.SERVER_ERROR,
                    status
                );
        }
    }

    // Handle network errors (no response received)
    if (error.request) {
        return new AppError(
            'Network error. Please check your internet connection.',
            ERROR_CODES.NETWORK_ERROR,
            0
        );
    }

    // Handle other errors
    return new AppError(
        error.message || 'An unexpected error occurred',
        ERROR_CODES.UNKNOWN_ERROR,
        500
    );
};

/**
 * Log error to console in development, or to error tracking service in production
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context about where the error occurred
 */
export const logError = (error, context = {}) => {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        ...context,
    };

    if (import.meta.env.DEV) {
        console.error('Error:', errorInfo);
    } else {
        // In production, send to error tracking service (e.g., Sentry)
        // Example: Sentry.captureException(error, { extra: errorInfo });
        console.error('Production error:', error.message);
    }
};

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
    if (error instanceof AppError) {
        return error.message;
    }

    // Fallback for unknown errors
    return import.meta.env.PROD
        ? 'Something went wrong. Please try again.'
        : error.message || 'An unexpected error occurred';
};

/**
 * Check if error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
    return error instanceof AppError && error.code === ERROR_CODES.NETWORK_ERROR;
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
export const isAuthError = (error) => {
    return error instanceof AppError &&
        (error.code === ERROR_CODES.UNAUTHORIZED || error.code === ERROR_CODES.FORBIDDEN);
};

/**
 * Check if error is a validation error
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
export const isValidationError = (error) => {
    return error instanceof AppError && error.code === ERROR_CODES.VALIDATION_ERROR;
};
