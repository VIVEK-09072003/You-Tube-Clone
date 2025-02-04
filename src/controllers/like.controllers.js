import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";  // Assuming you have a Like model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";  // Assuming you have a Video model
import { Comment } from "../models/comment.model.js";  // Assuming you have a Comment model
import { Tweet } from "../models/tweet.model.js";  // Assuming you have a Tweet model

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Check if the user has already liked this video
    const existingLike = await Like.findOne({ userId, videoId });
    if (existingLike) {
        // If the user has already liked the video, remove the like
        await Like.deleteOne({ userId, videoId });
        return new ApiResponse(res).success({ message: "Like removed from video" });
    } else {
        // If the user has not liked the video, add a new like
        const newLike = new Like({ userId, videoId });
        await newLike.save();
        return new ApiResponse(res).success({ message: "Video liked", data: newLike });
    }
});

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError("Invalid comment ID", 400);
    }

    // Check if the user has already liked this comment
    const existingLike = await Like.findOne({ userId, commentId });
    if (existingLike) {
        // If the user has already liked the comment, remove the like
        await Like.deleteOne({ userId, commentId });
        return new ApiResponse(res).success({ message: "Like removed from comment" });
    } else {
        // If the user has not liked the comment, add a new like
        const newLike = new Like({ userId, commentId });
        await newLike.save();
        return new ApiResponse(res).success({ message: "Comment liked", data: newLike });
    }
});

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user.id;

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError("Invalid tweet ID", 400);
    }

    // Check if the user has already liked this tweet
    const existingLike = await Like.findOne({ userId, tweetId });
    if (existingLike) {
        // If the user has already liked the tweet, remove the like
        await Like.deleteOne({ userId, tweetId });
        return new ApiResponse(res).success({ message: "Like removed from tweet" });
    } else {
        // If the user has not liked the tweet, add a new like
        const newLike = new Like({ userId, tweetId });
        await newLike.save();
        return new ApiResponse(res).success({ message: "Tweet liked", data: newLike });
    }
});

// Get all liked videos by the user
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Fetch all the liked videos by the user
    const likedVideos = await Like.find({ userId })
        .populate("videoId", "title description")  // Populate video details (assuming "videoId" is referenced)
        .exec();

    if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError("No liked videos found", 404);
    }

    return new ApiResponse(res).success({ data: likedVideos });
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};
