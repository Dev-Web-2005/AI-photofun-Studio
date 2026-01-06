from django.urls import path
from .views import (
    VideoGalleryListView,
    VideoGalleryDetailView,
    VideoGalleryDeletedListView,
    VideoGalleryRestoreView,
    VideoGalleryPermanentDeleteView,
    VideoGalleryCountView,
)

urlpatterns = [
    # Count all videos for a user
    path('count', VideoGalleryCountView.as_view(), name='video-gallery-count'),
    
    # List videos
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
