// Utility for standardized responses
exports.apiResponse = (status, message, data = null) => {
    return { status, message, data };
};
