function get404(req, res) {
  return res.status(404).render("messages/error", {
    pageTitle: "Страница не найдена",
    statusCode: res.statusCode
  });
}

function get500(req, res) {
  return res.status(500).render("messages/error", {
    pageTitle: "Серверная ошибка",
    statusCode: res.statusCode
  });
}

export default {
  get404,
  get500
};