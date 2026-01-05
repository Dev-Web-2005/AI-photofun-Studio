"""Views for Video Gallery API"""

from rest_framework.views import APIView
from core import APIResponse
from .services import video_gallery_service, VideoGalleryError
from .serializers import VideoGallerySerializer, VideoGalleryListSerializer


class VideoGalleryListView(APIView):
    """
    GET: List all videos for a user (non-deleted only)
    """
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return APIResponse.error(message='user_id is required')

        try:
            limit = int(request.query_params.get('limit', 50))
            offset = int(request.query_params.get('offset', 0))
            videos = video_gallery_service.get_user_videos(user_id, limit, offset)
            serializer = VideoGalleryListSerializer(videos, many=True)
            return APIResponse.success(result=serializer.data)
        except VideoGalleryError as e:
            return APIResponse.error(message=str(e))


class VideoGalleryDetailView(APIView):
    """
    GET: Retrieve a specific video by ID
    DELETE: Soft delete a video
    """
    def get(self, request, video_id):
        try:
            video = video_gallery_service.get_video_by_id(str(video_id))
            if not video:
                return APIResponse.error(message='Video not found', status_code=404)
            serializer = VideoGallerySerializer(video)
            return APIResponse.success(result=serializer.data)
        except VideoGalleryError as e:
            return APIResponse.error(message=str(e))

    def delete(self, request, video_id):
        try:
            success = video_gallery_service.soft_delete_video(str(video_id))
            if success:
                return APIResponse.success(message='Video deleted successfully')
            return APIResponse.error(message='Video not found or already deleted', status_code=404)
        except VideoGalleryError as e:
            return APIResponse.error(message=str(e))


class VideoGalleryDeletedListView(APIView):
    """GET: List all deleted videos for a user"""
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return APIResponse.error(message='user_id is required')

        try:
            limit = int(request.query_params.get('limit', 50))
            offset = int(request.query_params.get('offset', 0))
            videos = video_gallery_service.get_deleted_videos(user_id, limit, offset)
            serializer = VideoGallerySerializer(videos, many=True)
            return APIResponse.success(result=serializer.data)
        except VideoGalleryError as e:
            return APIResponse.error(message=str(e))


class VideoGalleryRestoreView(APIView):
    """POST: Restore a soft-deleted video"""
    def post(self, request, video_id):
        try:
            video = video_gallery_service.get_video_by_id(str(video_id))
            if not video:
                return APIResponse.error(message='Video not found', status_code=404)

            if not video.get('deleted_at'):
                return APIResponse.error(message='Video is not deleted')

            success = video_gallery_service.restore_video(str(video_id))
            if success:
                video = video_gallery_service.get_video_by_id(str(video_id))
                serializer = VideoGallerySerializer(video)
                return APIResponse.success(
                    result=serializer.data,
                    message='Video restored successfully'
                )
            return APIResponse.error(message='Failed to restore video')
        except VideoGalleryError as e:
            return APIResponse.error(message=str(e))


class VideoGalleryPermanentDeleteView(APIView):
    """DELETE: Permanently delete a video from database"""
    def delete(self, request, video_id):
        try:
            success = video_gallery_service.permanent_delete_video(str(video_id))
            if success:
                return APIResponse.success(message='Video permanently deleted')
            return APIResponse.error(message='Video not found', status_code=404)
        except VideoGalleryError as e:
            return APIResponse.error(message=str(e))
