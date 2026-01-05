"""Views for Stats API"""

from rest_framework.views import APIView
from core import APIResponse
from apps.image_gallery.services import image_gallery_service, ImageGalleryError
from apps.video_gallery.services import video_gallery_service, VideoGalleryError


class UserStatsView(APIView):
    """
    GET: Get user statistics (image count, video count)
    """
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return APIResponse.error(message='user_id is required')

        try:
            image_count = image_gallery_service.count_user_images(user_id)
        except ImageGalleryError:
            image_count = 0

        try:
            video_count = video_gallery_service.count_user_videos(user_id)
        except VideoGalleryError:
            video_count = 0

        return APIResponse.success(result={
            'user_id': user_id,
            'image_count': image_count,
            'video_count': video_count,
            'total_count': image_count + video_count,
        })
