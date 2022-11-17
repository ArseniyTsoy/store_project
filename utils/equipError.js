export default function equipError(err) {
  const error = new Error(err);
  error.httpStatusCode = err.httpStatusCode || 500;
  return error;
}