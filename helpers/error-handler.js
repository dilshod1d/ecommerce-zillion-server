function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'The user is not authorized' });
  }
  return res.status(500).json({ error: err });
}
module.exports = errorHandler;
