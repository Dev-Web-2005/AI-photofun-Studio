from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from core import APIResponse
from .models import VideoGallery
from .serializers import VideoGallerySerializer, VideoGalleryListSerializer


class VideoGalleryCountView(APIView):
    """GET: Count all videos for a user (including deleted)"""
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return APIResponse.error(message='user_id is required')

        count = VideoGallery.objects.filter(user_id=user_id).count()
        return APIResponse.success(result={'count': count})


class VideoGalleryListView(APIView):
    """
    GET: List all videos for a user (non-deleted only, SUCCEEDED status)
    """
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return APIResponse.error(message='user_id is required')

        videos = VideoGallery.objects.filter(
            user_id=user_id,
            deleted_at__isnull=True,
            status='SUCCEEDED'
        )
        serializer = VideoGalleryListSerializer(videos, many=True)
        return APIResponse.success(result=serializer.data)


class VideoGalleryDetailView(APIView):
    """
    GET: Retrieve a specific video by ID
    DELETE: Soft delete a video
    """
    def get(self, request, video_id):
        video = get_object_or_404(VideoGallery, video_id=video_id)
        serializer = VideoGallerySerializer(video)
        return APIResponse.success(result=serializer.data)

    def delete(self, request, video_id):
        video = get_object_or_404(VideoGallery, video_id=video_id)
        video.soft_delete()
        return APIResponse.success(message='Video deleted successfully')


class VideoGalleryDeletedListView(APIView):
    """GET: List all deleted videos for a user"""
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return APIResponse.error(message='user_id is required')

        videos = VideoGallery.objects.filter(
            user_id=user_id,
            deleted_at__isnull=False
        )
        serializer = VideoGalleryListSerializer(videos, many=True)
        return APIResponse.success(result=serializer.data)


class VideoGalleryRestoreView(APIView):
    """POST: Restore a soft-deleted video"""
    def post(self, request, video_id):
        video = get_object_or_404(VideoGallery, video_id=video_id)
        
        if not video.is_deleted:
            return APIResponse.error(message='Video is not deleted')

        video.restore()
        serializer = VideoGallerySerializer(video)
        return APIResponse.success(
            result=serializer.data,
            message='Video restored successfully'
        )


class VideoGalleryPermanentDeleteView(APIView):
    """DELETE: Permanently delete a video from database"""
    def delete(self, request, video_id):
        video = get_object_or_404(VideoGallery, video_id=video_id)
        video.delete()
        return APIResponse.success(message='Video permanently deleted')
