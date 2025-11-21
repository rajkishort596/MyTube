import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getChannelTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(upload.single("image"), createTweet);
router.route("/channel/:channelId").get(getChannelTweets);
router
  .route("/:tweetId")
  .patch(upload.single("image"), updateTweet)
  .delete(deleteTweet);

export default router;
