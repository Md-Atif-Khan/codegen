const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500; 
    const status = err.status || 'error'; 
    res.status(statusCode).json({
        status,
        statusCode,
        message: err.message,
    });
};

export default errorHandler;
