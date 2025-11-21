import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const createTweet = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required to create a tweet");
  }

  let imageLocalPath = req?.file?.path;
  let image = null;

  if (req.file) {
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    image = {
      url: uploadedImage?.url,
      publicId: uploadedImage?.public_id,
    };
  }

  // Create tweet
  const tweet = await Tweet.create({
    content,
    image,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create Tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet Created Successfully"));
});

const getChannelTweets = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  let matchQuery = {};
  if (channelId) {
    matchQuery.owner = new mongoose.Types.ObjectId(channelId);
  }

  const tweets = await Tweet.aggregate([
    { $match: matchQuery },

    // Join with Likes collection
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },

    // Add stats
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLikedByUser: userId
          ? {
              $in: [new mongoose.Types.ObjectId(userId), "$likes.likedBy"],
            }
          : false,
      },
    },

    {
      $project: {
        likes: 0,
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Channel Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }
  const { content } = req.body;
  const imageLocalPath = req?.file?.path;

  if (!content && !imageLocalPath) {
    throw new ApiError(
      400,
      "Please provide content or image to update the tweet"
    );
  }

  const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });
  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you are not the owner");
  }

  if (content) {
    tweet.content = content;
  }

  if (imageLocalPath) {
    // Delete the old image (if exists)
    if (tweet.image && tweet.image.publicId) {
      await deleteFromCloudinary(tweet.image.publicId);
    }

    // Upload new image
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);

    tweet.image = {
      url: uploadedImage?.url,
      publicId: uploadedImage?.public_id,
    };
  }

  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }

  const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });
  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you are not the owner");
  }

  // Delete image from Cloudinary if exists
  if (tweet.image?.publicId) {
    await deleteFromCloudinary(tweet.image.publicId);
  }

  await Tweet.deleteOne({ _id: tweetId, owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getChannelTweets, updateTweet, deleteTweet };
