//to check if user is admin for route logic
const adminmidware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next(); // Proceed if the user is an admin
};

module.exports = adminmidware;
