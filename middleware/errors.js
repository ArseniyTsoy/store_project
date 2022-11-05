function get404(req, res) {
  return res.status(404).render("errors/404", {
    pageTitle: "Страница не найдена"
  });
}

function get500(req, res) {
  return res.status(500).render("errors/500", {
    pageTitle: "Серверная ошибка"
  });
}

export default {
  get404,
  get500
};