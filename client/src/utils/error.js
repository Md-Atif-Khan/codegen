const errorMap = {
    100: 'Continue',
    102: 'Processing',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    206: 'Partial Content',
    301: 'Moved Permanently',
    302: 'Found',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
};

export const customErrorMessage = (error) => {
    // const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    const statusCode = error.response?.status || 500;
    return `${statusCode} ${errorMap[statusCode]}`;
};