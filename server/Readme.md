# 📡 MyTube Server (Backend)

A complete production‑ready **Node.js + Express + MongoDB** backend for a YouTube‑like video platform. This server powers authentication, video management, comments, likes, playlists, subscriptions, uploads, dashboards, and more.

## 📑 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Structure](#api-structure)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)

---

## Features

- Full authentication (register, login, logout, refresh token)
- Public + protected routes with lazy authentication
- Video upload, update, delete, publish toggle
- Video statistics, dashboard analytics
- Comments, likes, playlists, subscriptions
- Watch history tracking
- Cloudinary direct upload support
- Secure password reset & email support
- Modular folder structure with clean architecture

---

## Technologies Used

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT Authentication**
- **Cloudinary Direct Upload**
- **Multer** for file handling
- **Nodemailer** (if used)
- **Cookie-based authentication**

---

## API Structure

The API follows a clean modular structure with separate route files and controllers:

- `/users` → User authentication & profile
- `/videos` → Video CRUD + stats
- `/comments` → Video comments
- `/likes` → Like toggle system
- `/tweets` → Micro‑posts
- `/playlist` → User playlists
- `/subscriptions` → Channel subscriptions
- `/dashboard` → Public analytics
- `/upload` → Cloudinary signature

---

## Setup & Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/rajkishort596/MyTube.git
   cd server
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Create a `.env` file** in the root directory and add your environment variables:

   ```env
   PORT=8000
   NODE_ENV=dev
   FRONTEND_URL=your_frontend_url
   MONGODB_URI="mongodb_url"
   ACCESS_TOKEN_SECRET="your_access_token_secret"
   REFRESH_TOKEN_SECRET="your_refresh_token_secret"
   RESET_PASSWORD_SECRET="your_reset_password_secret"

   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

   EMAIL_HOST="smtp.example.com"
   EMAIL_USER="your_email_user"
   EMAIL_PASS="your_email_password"
   EMAIL_FROM="your_email_user"
   ```

4. **Start the server:**
   ```sh
   npm start
   # or
   yarn start
   ```

---

## API Endpoints

Below is the full list of API routes grouped by module: (Backend)
A complete production‑ready **Node.js + Express + MongoDB** backend for a YouTube‑like video platform. This server powers authentication, video management, comments, likes, playlists, subscriptions, uploads, dashboards, and more.

Base Path for all routes:

```
/api/v1
```

---

# ✅ Health

### **GET /healthcheck/**

Basic server status check.

- **Controller:** `healthcheck`

---

# 👤 Users (Public + Protected)

| Method | Route                    | Description                                            | Controller            |
| ------ | ------------------------ | ------------------------------------------------------ | --------------------- |
| POST   | `/users/register`        | Register new user (multipart: avatar, cover image)     | registerUser          |
| POST   | `/users/login`           | Login with username/email → returns tokens via cookies | loginUser             |
| POST   | `/users/forgot-password` | Sends reset link via email                             | forgotPassword        |
| POST   | `/users/reset-password`  | Reset password using secure token                      | resetPassword         |
| POST   | `/users/logout`          | Clear auth tokens (protected)                          | logoutUser            |
| POST   | `/users/refresh-token`   | Refresh access token                                   | refreshAccessToken    |
| GET    | `/users/current-user`    | Fetch logged-in user profile                           | getCurrentUser        |
| PATCH  | `/users/update-account`  | Update username, email etc                             | updateAccountDetails  |
| PATCH  | `/users/avatar`          | Update avatar image                                    | updateUserAvatar      |
| PATCH  | `/users/cover-image`     | Update cover image                                     | updateUserCoverImage  |
| GET    | `/users/c/:username`     | Get channel profile by username                        | getUserChannelProfile |
| GET    | `/users/history`         | Watch history of user                                  | getWatchHistory       |

---

# 📤 Upload (Cloudinary Direct Upload)

| Method | Route                         | Description | Controller                                       |                    |
| ------ | ----------------------------- | ----------- | ------------------------------------------------ | ------------------ |
| GET    | `/upload/signature?type=video | image`      | Generate signed parameters for Cloudinary upload | getUploadSignature |

---

# 🎬 Videos

| Method | Route                             | Description                                                | Controller          |
| ------ | --------------------------------- | ---------------------------------------------------------- | ------------------- |
| GET    | `/videos/`                        | List all published videos with filters, search, pagination | getAllVideos        |
| POST   | `/videos/`                        | Publish new video metadata                                 | publishAVideo       |
| GET    | `/videos/:videoId`                | Fetch a single video (lazy auth) and auto‑increment views  | getVideoById        |
| GET    | `/videos/:videoId/stats`          | Fetch views, likes, comments count                         | getVideoStats       |
| PATCH  | `/videos/:videoId`                | Update video (title, desc, thumbnail)                      | updateVideo         |
| DELETE | `/videos/:videoId`                | Delete video (owner only)                                  | deleteVideo         |
| PATCH  | `/videos/toggle/publish/:videoId` | Toggle publish/unpublish                                   | togglePublishStatus |

**Note:** `/stats` route must be placed _before_ `/:videoId` to avoid shadowing.

---

# 💬 Comments (Protected)

| Method | Route                    | Description                    | Controller       |
| ------ | ------------------------ | ------------------------------ | ---------------- |
| GET    | `/comments/:videoId`     | Paginated comments for a video | getVideoComments |
| POST   | `/comments/:videoId`     | Add comment to video           | addComment       |
| PATCH  | `/comments/c/:commentId` | Update comment (owner only)    | updateComment    |
| DELETE | `/comments/c/:commentId` | Delete comment (owner only)    | deleteComment    |

---

# 👍 Likes (Protected)

| Method | Route                        | Description                           | Controller        |
| ------ | ---------------------------- | ------------------------------------- | ----------------- |
| POST   | `/likes/toggle/v/:videoId`   | Toggle like on a video                | toggleVideoLike   |
| POST   | `/likes/toggle/c/:commentId` | Toggle like on a comment              | toggleCommentLike |
| POST   | `/likes/toggle/t/:tweetId`   | Toggle like on a tweet                | toggleTweetLike   |
| GET    | `/likes/videos`              | List all liked videos of current user | getLikedVideos    |

---

# 🐦 Tweets (Protected)

| Method | Route                        | Description                                          | Controller       |
| ------ | ---------------------------- | ---------------------------------------------------- | ---------------- |
| POST   | `/tweets/`                   | Create a tweet (optional image)                      | createTweet      |
| GET    | `/tweets/channel/:channelId` | Fetch channel tweets with like count + isLikedByUser | getChannelTweets |
| PATCH  | `/tweets/:tweetId`           | Update tweet                                         | updateTweet      |
| DELETE | `/tweets/:tweetId`           | Delete tweet                                         | deleteTweet      |

---

# 📂 Playlists (Protected)

| Method | Route                                   | Description                | Controller              |
| ------ | --------------------------------------- | -------------------------- | ----------------------- |
| POST   | `/playlist/`                            | Create playlist            | createPlaylist          |
| GET    | `/playlist/:playlistId`                 | Playlist details           | getPlaylistById         |
| PATCH  | `/playlist/:playlistId`                 | Update playlist            | updatePlaylist          |
| DELETE | `/playlist/:playlistId`                 | Delete playlist            | deletePlaylist          |
| PATCH  | `/playlist/add/:videoId/:playlistId`    | Add video to playlist      | addVideoToPlaylist      |
| PATCH  | `/playlist/remove/:videoId/:playlistId` | Remove video from playlist | removeVideoFromPlaylist |
| GET    | `/playlist/user/:userId`                | All playlists of a user    | getUserPlaylists        |

---

# 🔔 Subscriptions (Protected)

| Method | Route                            | Description                     | Controller                |
| ------ | -------------------------------- | ------------------------------- | ------------------------- |
| POST   | `/subscriptions/c/:channelId`    | Subscribe / Unsubscribe         | toggleSubscription        |
| GET    | `/subscriptions/c/:channelId`    | Get channel subscribers         | getUserChannelSubscribers |
| GET    | `/subscriptions/u/:subscriberId` | Get channels subscribed by user | getSubscribedChannels     |

---

# 📊 Dashboard (Public)

| Method | Route                          | Description                                   | Controller       |
| ------ | ------------------------------ | --------------------------------------------- | ---------------- |
| GET    | `/dashboard/stats/:channelId`  | Aggregated stats (views, subs, likes, videos) | getChannelStats  |
| GET    | `/dashboard/videos/:channelId` | Paginated list of channel videos              | getChannelVideos |

---

# 🚀 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Cloudinary Direct Upload
- JWT Auth + Cookies
- Multer for Multipart Uploads

---

# 📁 Folder Structure (Simplified)

```
server/
│── src/
│   ├── controllers/
│   ├── db/
│   ├── models/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
|   │── app.js
|   │── constants.js
|   │── index.js
│── .env
│── .gitignore
│── package.json
│── package-lock.json
│── README.md
```

---

# 📝 Notes

This backend is fully modular, scalable, and built following **industry‑grade architecture** with:

- asyncHandler wrapper for clean error handling
- ApiResponse + ApiError for consistent API design
- Lazy JWT verification for public video access
- Direct Cloudinary uploads for performance
- MongoDB aggregation pipelines for analytics
- Pagination built into multiple endpoints

---

# Owner: **@Rajkishor Thakur**

- Description: This README serves as comprehensive documentation for the MyTube backend, offering essential guidance for understanding and working with the project.
