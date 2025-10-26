import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getUploadSignature = asyncHandler(async (req, res) => {
  // type = "video" or "image" (sent as query param)
  const { type } = req.query;

  if (!type || !["video", "image"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid upload type. Must be 'video' or 'image'.",
    });
  }

  // Choossing folder based on type
  const folder = type === "video" ? "mytube/videos" : "mytube/thumbnails";

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  if (!signature) {
    throw new ApiError(500, "Failed to generate upload signature");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  );
});

export { getUploadSignature };
