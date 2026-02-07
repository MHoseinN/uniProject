const jwt = require('jsonwebtoken');

function getToken(req) {
  const header = req.headers.authorization || '';// bearer token
  return header.split(' ')[1]; // ["bearer,"token str"]
}

exports.requireUser = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret'); // compare bet jwt secret Vs token
    if (payload.role !== 'user') return res.status(403).json({ error: 'Forbidden' });
    req.userId = payload.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.requireAdmin = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.adminId = payload.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
