import mongoose, { Schema } from "mongoose";

const tweetSchma = new Schema(
    {
        content:{
            type: String,
            required: true
        },
        owner:{
            type:Schema.Types.ObjectBy,
            ref: 'User',
        }
    },
    {
        timestamps: true
    }
)

export const Tweet = mongoose.model("Tweet", tweetSchma) 