import { aiClient } from "./aiApi";

const GALLERY_BASE = "/api/v1/ai/gallery";

export const galleryApi = {
  // Count total images for a user (including deleted)
  getImageCount: (userId) =>
    aiClient.get(`${GALLERY_BASE}/count`, {
      params: { user_id: userId },
    }),

  // Get all images for the current user
  getImages: (userId) =>
    aiClient.get(`${GALLERY_BASE}`, {
      params: { user_id: userId },
    }),

  // Get a specific image by ID
  getImageById: (imageId) => aiClient.get(`${GALLERY_BASE}/${imageId}`),

  // Get deleted images
  getDeletedImages: (userId) =>
    aiClient.get(`${GALLERY_BASE}/deleted`, {
      params: { user_id: userId },
    }),

  // Soft delete an image
  deleteImage: (imageId) => aiClient.delete(`${GALLERY_BASE}/${imageId}`),

  // Restore a deleted image
  restoreImage: (imageId) =>
    aiClient.post(`${GALLERY_BASE}/${imageId}/restore`),

  // Permanently delete an image
  permanentDeleteImage: (imageId) =>
    aiClient.delete(`${GALLERY_BASE}/${imageId}/permanent`),
};
