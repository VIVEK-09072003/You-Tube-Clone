import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

// Fetch all comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate videoId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    // Find comments for the given videoId with pagination
    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sort by newest comments first

    const totalComments = await Comment.countDocuments({ videoId });

    return new ApiResponse(res).success({
        data: comments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalComments,
        },
    });
});

// Add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    // Validate videoId and content
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError("Invalid video ID", 400);
    }

    if (!content || content.trim() === "") {
        throw new ApiError("Comment content cannot be empty", 400);
    }

    // Create and save the new comment
    const newComment = new Comment({
        videoId,
        userId: req.user.id, // Assuming user ID is attached to the request object
        content,
    });

    await newComment.save();

    return new ApiResponse(res).success({
        message: "Comment added successfully",
        data: newComment,
    });
});

// Update an existing comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate commentId and content
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError("Invalid comment ID", 400);
    }

    if (!content || content.trim() === "") {
        throw new ApiError("Comment content cannot be empty", 400);
    }

    // Find the comment by ID and ensure it exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError("Comment not found", 404);
    }

    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to update this comment", 403);
    }

    // Update the comment
    comment.content = content;
    await comment.save();

    return new ApiResponse(res).success({
        message: "Comment updated successfully",
        data: comment,
    });
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate commentId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError("Invalid comment ID", 400);
    }

    // Find the comment and ensure it exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError("Comment not found", 404);
    }

    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to delete this comment", 403);
    }

    // Delete the comment
    await comment.remove();

    return new ApiResponse(res).success({
        message: "Comment deleted successfully",
    });
});

export { getVideoComments, addComment, updateComment, deleteComment };
