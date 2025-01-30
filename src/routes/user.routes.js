import { Router } from "express";
import { loginUser, logoutUser,
     registerUser,refreshAccessToken, 
     changeCurrentPassword,
      getCurrentUser,
       updateAccountDetails, 
       updateUserAvatar, 
       updateUserCoverImage,
        getUserChannelProfile, 
        getWatchHistory 
    } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middlewares.js'

const router = Router()

router.route("/register").post
    (
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser
    )

router.route("/login").post(loginUser)

// secure 
router.route("/logout").post(verifyJWT, logoutUser)
router.route("refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/change-user").get(verifyJWT,getCurrentUser)
router.route("/updata-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage)
router.route("/change-user").get(verifyJWT,getCurrentUser)

router.route("/c/:userName").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)





export default router