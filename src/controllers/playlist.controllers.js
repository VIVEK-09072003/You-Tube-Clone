import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";  // Assuming you have a Video model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;  // Assuming user ID is attached to the request

    // Validate input
    if (!name || !description) {
        throw new ApiError("Name and description are required", 400);
    }

    // Create the playlist
    const newPlaylist = new Playlist({
        name,
        description,
        userId
    });

    await newPlaylist.save();

    return new ApiResponse(res).success({
        message: "Playlist created successfully",
        data: newPlaylist
    });
});

// Get all playlists of a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError("Invalid user ID", 400);
    }

    // Fetch the playlists of the user
    const playlists = await Playlist.find({ userId });

    if (!playlists || playlists.length === 0) {
        throw new ApiError("No playlists found for this user", 404);
    }

    return new ApiResponse(res).success({
        data: playlists
    });
});

// Get a playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist ID", 400);
    }

    // Fetch the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    return new ApiResponse(res).success({
        data: playlist
    });
});

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate playlistId and videoId
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError("Invalid playlist or video ID", 400);
    }

    // Fetch the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    // Fetch the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    // Check if the video is already in the playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError("Video already exists in the playlist", 400);
    }

    // Add the video to the playlist
    playlist.videos.push(videoId);
    await playlist.save();

    return new ApiResponse(res).success({
        message: "Video added to playlist",
        data: playlist
    });
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate playlistId and videoId
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError("Invalid playlist or video ID", 400);
    }

    // Fetch the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    // Check if the video exists in the playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError("Video not found in this playlist", 404);
    }

    // Remove the video from the playlist
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
    await playlist.save();

    return new ApiResponse(res).success({
        message: "Video removed from playlist",
        data: playlist
    });
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist ID", 400);
    }

    // Find and delete the playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    return new ApiResponse(res).success({
        message: "Playlist deleted successfully"
    });
});

// Update a playlist's details (name, description)
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist ID", 400);
    }

    // Validate input
    if (!name || !description) {
        throw new ApiError("Name and description are required", 400);
    }

    // Find and update the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    playlist.name = name;
    playlist.description = description;

    await playlist.save();

    return new ApiResponse(res).success({
        message: "Playlist updated successfully",
        data: playlist
    });
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
