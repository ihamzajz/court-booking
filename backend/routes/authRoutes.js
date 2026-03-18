const express = require("express");

const {
  registerUser,
  loginUser,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
  changePassword,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
router.get("/me", protect, getCurrentUser);
router.put("/change-password", protect, changePassword);

module.exports = router;
