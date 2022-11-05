export default function(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect("/auth/login");
  } else {
    next();
  }
};