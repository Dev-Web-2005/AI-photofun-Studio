"""URL routes for Video Gallery API"""

from django.urls import path
from .views import (
    VideoGalleryListView,
    VideoGalleryDetailView,
    VideoGalleryDeletedListView,
    VideoGalleryRestoreView,
    VideoGalleryPermanentDeleteView,
)

urlpatterns = [
    # List videos for a user
    path('', VideoGalleryListView.as_view(), name='video-gallery-list'),

    # Deleted videos
    path('deleted', VideoGalleryDeletedListView.as_view(), name='video-gallery-deleted'),

    # Video detail and soft delete
    path('<uuid:video_id>', VideoGalleryDetailView.as_view(), name='video-gallery-detail'),

    # Restore deleted video
    path('<uuid:video_id>/restore', VideoGalleryRestoreView.as_view(), name='video-gallery-restore'),

    # Permanent delete
    path('<uuid:video_id>/permanent', VideoGalleryPermanentDeleteView.as_view(), name='video-gallery-permanent-delete'),
]
