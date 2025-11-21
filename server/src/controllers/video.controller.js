import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const matchQuery = { isPublished: true };

  if (userId && mongoose.isValidObjectId(userId)) {
    matchQuery.owner = new mongoose.Types.ObjectId(userId);
  }
  if (query?.trim()) {
    matchQuery.title = { $regex: query.trim(), $options: "i" };
  }

  //sortStage
  const sortStage = { [sortBy]: sortType === "desc" ? -1 : 1 };

  const aggregatePipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },

    { $sort: sortStage },
  ];

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate(aggregatePipeline),
    options
  );

  if (!videos) {
    throw new ApiError(404, "Videos not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  /*
   *Video and thumbnail uploadation is handled by cloudinary direct upload from frontend
   *Here we are just saving the video metadata to database
   */

  const { title, description, videoFile, thumbnail, duration } = req.body;

  console.log(req.body);

  if (!title || !description || !videoFile || !thumbnail || !duration) {
    throw new ApiError(400, "All fields are required");
  }

  const video = await Video.create({
    title,
    description,
    videoFile,
    thumbnail,
    duration,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate({
    path: "owner",
    select: "username fullName avatar",
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const owner = req.user._id;

  if (!owner) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const { title, description } = req.body;

  if ([title, description].every((field) => !field?.trim())) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const video = await Video.findOne({ _id: videoId, owner });

  if (!video) {
    throw new ApiError(404, "Video not found or User is not the owner");
  }

  const updateData = {};

  if (title?.trim()) updateData.title = title;
  if (description?.trim()) updateData.description = description;

  if (req.file) {
    const thumbnailLocalPath = req.file.path;

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail file is missing");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }

    if (video.thumbnail?.publicId) {
      await deleteFromCloudinary(video.thumbnail?.publicId);
    }

    updateData.thumbnail = {
      url: thumbnail.url,
      publicId: thumbnail.public_id,
    };
  }
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const owner = req.user._id;

  if (!owner) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== owner.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  try {
    if (video.videoFile?.publicId) {
      await deleteFromCloudinary(video.videoFile.publicId, "video");
    }

    if (video.thumbnail?.publicId) {
      await deleteFromCloudinary(video.thumbnail.publicId);
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const owner = req.user._id;

  if (!owner) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== owner.toString()) {
    throw new ApiError(403, "You are not authorized to toggle publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status toggled successfully")
    );
});

const getVideoStats = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const [likesCount, commentsCount, video] = await Promise.all([
    Like.countDocuments({ video: videoId }),
    Comment.countDocuments({ video: videoId }),
    Video.findById(videoId).select("views"),
  ]);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        views: video.views || 0,
        likes: likesCount,
        comments: commentsCount,
      },
      "Video stats fetched successfully"
    )
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideoStats,
};
