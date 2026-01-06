import axiosClient from "./axiosClient";

const GALLERY_BASE = "/api/v1/ai/gallery";

export const galleryApi = {
  // Get all images for the current user
  getImages: (userId) =>
    axiosClient.get(`${GALLERY_BASE}`, {
      params: { user_id: userId },
    }),

  // Get a specific image by ID
  getImageById: (imageId) =>
    axiosClient.get(`${GALLERY_BASE}/${imageId}`),

  // Get deleted images
  getDeletedImages: (userId) =>
    axiosClient.get(`${GALLERY_BASE}/deleted`, {
      params: { user_id: userId },
    }),

  // Soft delete an image
  deleteImage: (imageId) =>
    axiosClient.delete(`${GALLERY_BASE}/${imageId}`),

  // Restore a deleted image
  restoreImage: (imageId) =>
    axiosClient.post(`${GALLERY_BASE}/${imageId}/restore`),

  // Permanently delete an image
  permanentDeleteImage: (imageId) =>
    axiosClient.delete(`${GALLERY_BASE}/${imageId}/permanent`),
};
