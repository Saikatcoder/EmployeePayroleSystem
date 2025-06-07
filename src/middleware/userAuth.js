import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Login again',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    if (decoded.id) {
     req.userId = decoded.id; 
    next();
 
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    console.log("JWT error:", error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export default userAuth;
