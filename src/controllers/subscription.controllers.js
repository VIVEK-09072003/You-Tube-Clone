import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription: Subscribe or Unsubscribe from a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id; // Assuming the user is authenticated and their ID is available in `req.user`

    // Validate the channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError("Invalid channel ID", 400); // Throw error if channelId is not valid
    }

    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({ userId, channelId });

    if (existingSubscription) {
        // If the user is already subscribed, unsubscribe (remove subscription)
        await Subscription.deleteOne({ userId, channelId });
        return new ApiResponse(res).success({ message: "Unsubscribed from channel" });
    } else {
        // If the user is not subscribed, subscribe (create a new subscription)
        const newSubscription = new Subscription({ userId, channelId });
        await newSubscription.save();
        return new ApiResponse(res).success({ message: "Subscribed to channel", data: newSubscription });
    }
});

// Get all subscribers of a specific channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate the channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError("Invalid channel ID", 400);
    }

    // Fetch all users who are subscribed to this channel
    const subscribers = await Subscription.find({ channelId })
        .populate("userId", "name email") // Populate user details like name and email
        .exec();

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError("No subscribers found for this channel", 404);
    }

    return new ApiResponse(res).success({ data: subscribers });
});

// Get all channels that a user is subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate the subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError("Invalid subscriber ID", 400);
    }

    // Fetch all channels the user is subscribed to
    const subscriptions = await Subscription.find({ userId: subscriberId })
        .populate("channelId", "name description") // Populate channel details like name and description
        .exec();

    if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError("No subscriptions found for this user", 404);
    }

    return new ApiResponse(res).success({ data: subscriptions });
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
