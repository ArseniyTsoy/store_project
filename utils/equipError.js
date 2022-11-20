export default function equipError(err) {
  let error = new Error(err);
  error.httpStatusCode = err.httpStatusCode || 500;
  return error;
}