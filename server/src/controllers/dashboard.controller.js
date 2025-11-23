import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const channelObjectId = new mongoose.Types.ObjectId(channelId);

  const totalViewsPromise = Video.aggregate([
    { $match: { owner: channelObjectId } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalSubscribersPromise = Subscription.countDocuments({
    channel: channelObjectId,
  });

  const totalVideosPromise = Video.countDocuments({
    owner: channelObjectId,
  });

  const totalLikesPromise = Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $match: {
        "videoDetails.owner": channelObjectId,
      },
    },
    { $count: "totalLikes" },
  ]);

  const [totalViewsResult, totalSubscribers, totalVideos, totalLikesResult] =
    await Promise.all([
      totalViewsPromise,
      totalSubscribersPromise,
      totalVideosPromise,
      totalLikesPromise,
    ]);

  const stats = {
    totalViews:
      totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0,
    totalSubscribers,
    totalVideos,
    totalLikes:
      totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pipeline = [
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        isPublished: 1,
      },
    },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
