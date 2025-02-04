import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Send a health check response with a simple "OK" status and a message
    res.status(200).json({
        status: "OK",
        message: "Service is running"
    });
});

export {
    healthcheck
};
