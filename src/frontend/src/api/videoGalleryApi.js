import axiosClient from "./axiosClient";

const VIDEO_GALLERY_BASE = "/api/v1/ai/video-gallery";

export const videoGalleryApi = {
    // Count total videos for a user (including deleted)
    getVideoCount: (userId) =>
        axiosClient.get(`${VIDEO_GALLERY_BASE}/count`, {
            params: { user_id: userId },
        }),

    // Get all videos for the current user (SUCCEEDED status only)
    getVideos: (userId) =>
        axiosClient.get(`${VIDEO_GALLERY_BASE}`, {
            params: { user_id: userId },
        }),

    // Get a specific video by ID
    getVideoById: (videoId) =>
        axiosClient.get(`${VIDEO_GALLERY_BASE}/${videoId}`),

    // Get deleted videos
    getDeletedVideos: (userId) =>
        axiosClient.get(`${VIDEO_GALLERY_BASE}/deleted`, {
            params: { user_id: userId },
        }),

    // Soft delete a video
    deleteVideo: (videoId) =>
        axiosClient.delete(`${VIDEO_GALLERY_BASE}/${videoId}`),

    // Restore a deleted video
    restoreVideo: (videoId) =>
        axiosClient.post(`${VIDEO_GALLERY_BASE}/${videoId}/restore`),

    // Permanently delete a video
    permanentDeleteVideo: (videoId) =>
        axiosClient.delete(`${VIDEO_GALLERY_BASE}/${videoId}/permanent`),
};
