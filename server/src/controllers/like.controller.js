import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await Like.findOneAndDelete({ video: videoId, likedBy: userId });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Video Unliked Successfully")
      );
  }

  const like = await Like.create({ video: videoId, likedBy: userId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: true, like }, "Video Liked Successfully")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment Id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (existingLike) {
    await Like.findOneAndDelete({ comment: commentId, likedBy: userId });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Comment Unliked Successfully")
      );
  }

  const like = await Like.create({ comment: commentId, likedBy: userId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: true, like }, "Comment Liked Successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    await Like.findOneAndDelete({ tweet: tweetId, likedBy: userId });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Tweet Unliked Successfully")
      );
  }

  const like = await Like.create({ tweet: tweetId, likedBy: userId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: true, like }, "Tweet Liked Successfully")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }
  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).populate("video");

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
