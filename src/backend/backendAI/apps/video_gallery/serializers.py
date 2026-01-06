from rest_framework import serializers
from .models import VideoGallery


class VideoGallerySerializer(serializers.ModelSerializer):
    """Full serializer for VideoGallery model."""
    is_deleted = serializers.ReadOnlyField()

    class Meta:
        model = VideoGallery
        fields = [
            'video_id',
            'user_id',
            'video_url',
            'prompt',
            'intent',
            'model',
            'task_id',
            'status',
            'metadata',
            'created_at',
            'updated_at',
            'deleted_at',
            'is_deleted',
        ]
        read_only_fields = ['video_id', 'created_at', 'updated_at']


class VideoGalleryListSerializer(serializers.ModelSerializer):
    """Minimal serializer for list views."""
    is_deleted = serializers.ReadOnlyField()

    class Meta:
        model = VideoGallery
        fields = [
            'video_id',
            'video_url',
            'prompt',
            'status',
            'created_at',
            'is_deleted',
        ]
