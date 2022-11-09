export default function(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    // Добавить флеш
    return res.redirect("/");
  }
};