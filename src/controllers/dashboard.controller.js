import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes, etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError("Invalid channel ID", 400);
    }

    // Get the total number of subscribers
    const totalSubscribers = await Subscription.countDocuments({ channelId });

    // Get the total number of videos
    const totalVideos = await Video.countDocuments({ channelId });

    // Get the total number of likes across all videos
    const totalLikes = await Like.countDocuments({ videoId: { $in: (await Video.find({ channelId })).map(v => v._id) } });

    // Get the total number of views across all videos
    const totalViews = await Video.aggregate([
        { $match: { channelId: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    return new ApiResponse(res).success({
        data: {
            totalSubscribers,
            totalVideos,
            totalLikes,
            totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0
        }
    });
});

// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError("Invalid channel ID", 400);
    }

    // Get the list of videos uploaded by the channel with pagination
    const videos = await Video.find({ channelId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sort by the newest videos

    const totalVideos = await Video.countDocuments({ channelId });

    return new ApiResponse(res).success({
        data: videos,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalVideos
        }
    });
});

export { getChannelStats, getChannelVideos };
