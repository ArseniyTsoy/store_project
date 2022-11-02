function showDashboard(_, res) {
  res.render("admin/admin", {
    pageTitle:""
  });
}

module.exports = {
  showDashboard
}