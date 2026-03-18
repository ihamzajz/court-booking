const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.adminOnly = (req, res, next) => {
  const role = req.user?.role;

  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
