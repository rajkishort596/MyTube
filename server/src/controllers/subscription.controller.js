import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSubscription = await Subscription.findOneAndDelete({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  }

  if (channelId === userId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const subscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  if (!subscription) {
    throw new ApiError(500, "Unable to subscribe, please try again later");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed: true, subscription },
        "Subscribed successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const subscribers = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "name email avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subcriber Id");
  }

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "name email avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subcribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
