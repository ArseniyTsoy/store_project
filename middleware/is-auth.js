export default function(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    return res.redirect("/auth/login");
  }
};