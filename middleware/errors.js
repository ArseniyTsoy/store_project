function get404(req, res) {
  return res.status(404).render("messages/error", {
    pageTitle: "Страница не найдена",
    statusCode: res.statusCode
  });
}

function getError(req, res) {
  const statusCode = parseInt(req.params.statusCode);

  return res.status(statusCode).render("messages/error", {
    pageTitle: "Серверная ошибка",
    statusCode: res.statusCode
  });
}

export default {
  get404,
  getError
};