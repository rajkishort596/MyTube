import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const matchQuery = {
    video: new mongoose.Types.ObjectId(videoId),
  };

  const pipeline = [
    { $match: matchQuery },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },

    {
      $project: {
        content: 1,
        createdAt: 1,
        "owner.username": 1,
        "owner.avatar.url": 1,
      },
    },
  ];

  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    customLabels: {
      totalDocs: "totalComments",
      docs: "comments",
    },
  };

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const owner = req.user._id;

  if (!owner) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Comment Content is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Added Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const owner = req.user._id;

  if (!owner) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment Id");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment Content is required");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner },
    {
      $set: {
        content: content?.trim(),
      },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const owner = req.user._id;

  if (!owner) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment Id");
  }
  const comment = await Comment.findOneAndDelete({ _id: commentId, owner });

  if (!comment) {
    throw new ApiError(404, "Comment not found or not authorized to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
