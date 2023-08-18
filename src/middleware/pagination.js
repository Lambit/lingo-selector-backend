const pagination = (req, res, next) => {
  const pageNum = Number.parseInt(req.query.page);
  const sizeNum = Number.parseInt(req.query.size);

  let page = Number.isNaN(pageNum) ? 0 : pageNum;
  if (page < 0) {
    page = 0;
  }
  let size = Number.isNaN(sizeNum) ? 10 : sizeNum;
  if (size > 10 || size < 1) {
    size = 10;
  }
  req.pagination = { size, page };
  next();
};

module.exports = pagination;
