import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js"; // Assuming you have a Tweet model
import { User } from "../models/user.model.js"; // Assuming you have a User model
import { ApiError } from "../utils/ApiError.js"; // Custom error handler
import { ApiResponse } from "../utils/ApiResponse.js"; // Custom API response formatter
import { asyncHandler } from "../utils/asyncHandler.js"; // Helper to catch async errors

// Create a tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // Assuming the user is authenticated and their ID is available in `req.user`

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError("Tweet content cannot be empty", 400);
    }

    // Create the tweet
    const newTweet = new Tweet({
        userId,
        content,
    });

    // Save the tweet to the database
    await newTweet.save();

    return new ApiResponse(res).success({
        message: "Tweet created successfully",
        data: newTweet,
    });
});

// Get all tweets by a user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params; // The userId from the URL params

    // Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError("Invalid user ID", 400);
    }

    // Fetch the tweets by the user
    const tweets = await Tweet.find({ userId }).sort({ createdAt: -1 }); // Sort by most recent tweets

    if (!tweets || tweets.length === 0) {
        throw new ApiError("No tweets found for this user", 404);
    }

    return new ApiResponse(res).success({
        message: "User tweets fetched successfully",
        data: tweets,
    });
});

// Update an existing tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; // The tweetId from the URL params
    const { content } = req.body; // New content for the tweet

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError("Invalid tweet ID", 400);
    }

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError("Tweet content cannot be empty", 400);
    }

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError("Tweet not found", 404);
    }

    // Check if the user is the owner of the tweet
    if (tweet.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to update this tweet", 403);
    }

    // Update the tweet content
    tweet.content = content;
    await tweet.save();

    return new ApiResponse(res).success({
        message: "Tweet updated successfully",
        data: tweet,
    });
});

// Delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; // The tweetId from the URL params

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError("Invalid tweet ID", 400);
    }

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError("Tweet not found", 404);
    }

    // Check if the user is the owner of the tweet
    if (tweet.userId.toString() !== req.user.id) {
        throw new ApiError("You are not authorized to delete this tweet", 403);
    }

    // Delete the tweet
    await tweet.remove();

    return new ApiResponse(res).success({
        message: "Tweet deleted successfully",
    });
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};
