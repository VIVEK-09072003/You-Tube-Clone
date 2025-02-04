import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";  // Assuming Video model is defined
import { User } from "../models/user.model.js";  // Assuming User model is defined
import { ApiError } from "../utils/ApiError.js";  // Custom error handler
import { ApiResponse } from "../utils/ApiResponse.js";  // Custom API response formatter
import { asyncHandler } from "../utils/asyncHandler.js";  // Helper to catch async errors
import { uploadOnCloudinary } from "../utils/cloudinary.js";  // Utility to upload media to Cloudinary

// Get all videos with query, sort, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    
    // Build search query
    const searchQuery = query ? { title: { $regex: query, $options: "i" } } : {};

    // Add user filter if provided
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError("Invalid user ID", 400);
        }
        searchQuery.userId = userId;
    }

    // Sort options
    const sortOptions = sortBy && sortType ? { [sortBy]: sortType === "desc" ? -1 : 1 } : { createdAt: -1 };

    // Paginate and fetch videos
    const videos = await Video.find(searchQuery)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .exec();

    const totalVideos = await Video.countDocuments(searchQuery);

    return new ApiResponse(res).success({
        data: videos,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalVideos,
        },
    });
});

// Publish a video by uploading to Cloudinary and saving details
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id;  // Assuming user is authenticated and their ID is in req.user

    if (!title || !description) {
        throw new ApiError("Title and description are required", 400);
    }

    // Upload video file to Cloudinary (assuming video is uploaded as part of the request)
    const videoFile = req.files?.video;  // Assuming video file is in 'video' field of the request
    if (!videoFile) {
        throw new ApiError("Video file is required", 400);
    }

    const cloudinaryResponse = await uploadOnCloudinary(videoFile, "video");
    
    // Create a new Video document
    const newVideo = new Video({
        title,
        description,
        userId,
        videoUrl: cloudinaryResponse.url,
        cloudinaryId: cloudinaryResponse.public_id,
    });

    await newVideo.save();

    return new ApiResponse(res).success({
        message: "Video published successfully",
        data: newVideo,
    });
});

// Get a video by its ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Fetch video details by ID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    return new ApiResponse(res).success({
        data: video,
    });
});

// Update video details (title, description, thumbnail)
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Find the video by ID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    // Check if the user is authorized to update the video
    if (video.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to update this video", 403);
    }

    // Update video details
    if (title) video.title = title;
    if (description) video.description = description;
    
    // If a thumbnail is provided, upload it to Cloudinary
    const thumbnailFile = req.files?.thumbnail;
    if (thumbnailFile) {
        const cloudinaryResponse = await uploadOnCloudinary(thumbnailFile, "image");
        video.thumbnailUrl = cloudinaryResponse.url;
    }

    await video.save();

    return new ApiResponse(res).success({
        message: "Video updated successfully",
        data: video,
    });
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Find the video by ID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    // Check if the user is authorized to delete the video
    if (video.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to delete this video", 403);
    }

    // Delete video from Cloudinary (if cloudinaryId exists)
    if (video.cloudinaryId) {
        await uploadOnCloudinary.deleteFromCloudinary(video.cloudinaryId);
    }

    // Delete video from the database
    await video.remove();

    return new ApiResponse(res).success({
        message: "Video deleted successfully",
    });
});

// Toggle the publish status of a video (e.g., make it public or private)
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Find the video by ID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    // Check if the user is authorized to toggle the video publish status
    if (video.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to change the publish status of this video", 403);
    }

    // Toggle publish status (assuming we have a 'isPublished' field)
    video.isPublished = !video.isPublished;
    await video.save();

    return new ApiResponse(res).success({
        message: `Video publish status changed to ${video.isPublished ? "published" : "unpublished"}`,
        data: video,
    });
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
