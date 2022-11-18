import equipError from "../utils/equipError.js";

export default function(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  } else {
    const err = new Error("Попытка доступа к админке без соответсвующих прав");
    err.httpStatusCode = 403;
    return next(equipError(err));
  }
};