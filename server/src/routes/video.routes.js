import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  getVideoStats,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { lazyVerifyJWT, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/* ----------------
   @ PUBLIC ROUTES
  ---------------- */

router.get("/", getAllVideos);
router.get("/:videoId", lazyVerifyJWT, getVideoById);
router.get("/:videoId/stats", getVideoStats);

/* ---------------- 
   @ PROTECTED ROUTES 
  ---------------- */

router.post("/", verifyJWT, publishAVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/:videoId", verifyJWT, upload.single("thumbnail"), updateVideo);

// Toggle publish / unpublish
router.patch("/toggle/publish/:videoId", verifyJWT, togglePublishStatus);

export default router;
