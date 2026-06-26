function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 60);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paged(data, total, page, limit) {
  return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
}

module.exports = { getPagination, paged };
