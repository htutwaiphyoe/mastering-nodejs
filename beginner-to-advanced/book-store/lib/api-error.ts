export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }

  static notFound(message = "Resource not found.") {
    return new ApiError(404, message);
  }

  static badRequest(message = "Bad request.") {
    return new ApiError(400, message);
  }

  static conflict(message = "Resource already exists.") {
    return new ApiError(409, message);
  }
}
