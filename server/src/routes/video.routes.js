import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/* ----------------
   @ PUBLIC ROUTES
  ---------------- */

router.get("/", getAllVideos);
router.get("/:videoId", getVideoById);

/* ---------------- 
   @ PROTECTED ROUTES 
  ---------------- */

router.post("/", verifyJWT, publishAVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/:videoId", verifyJWT, upload.single("thumbnail"), updateVideo);

// Toggle publish / unpublish
router.patch("/toggle/publish/:videoId", verifyJWT, togglePublishStatus);

export default router;
