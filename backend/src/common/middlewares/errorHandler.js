import config from "../../config/index.js";

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  if (config.nodeEnv === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(config.nodeEnv === "development" && err.stack && { stack: err.stack }),
  });
}
