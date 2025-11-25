import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/user.model.js";

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email });
  } else if (user.verified) {
    // Block if already registered
    throw new ApiError(400, "Email is already registered");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();
  await sendEmail(
    user.email,
    "Your OTP Code",
    `Your OTP code is: ${otp}. It will expire in 5 minutes.`
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpExpiry) {
    throw new ApiError(400, "OTP not found or expired");
  }

  if (user.otpExpiry < new Date()) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(400, "OTP expired");
  }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP verified successfully"));
});

export { sendOtp, verifyOtp };
