"""Serializers for Video Gallery API"""

from rest_framework import serializers


class VideoGallerySerializer(serializers.Serializer):
    """Full video serializer"""
    video_id = serializers.UUIDField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    video_url = serializers.URLField(read_only=True, allow_null=True)
    prompt = serializers.CharField(read_only=True, allow_null=True)
    intent = serializers.CharField(read_only=True, allow_null=True)
    model = serializers.CharField(read_only=True, allow_null=True)
    task_id = serializers.CharField(read_only=True, allow_null=True)
    status = serializers.CharField(read_only=True, allow_null=True)
    metadata = serializers.JSONField(read_only=True, default=dict)
    created_at = serializers.DateTimeField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True, allow_null=True)


class VideoGalleryListSerializer(serializers.Serializer):
    """Serializer for list view (excludes deleted_at)"""
    video_id = serializers.UUIDField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    video_url = serializers.URLField(read_only=True, allow_null=True)
    prompt = serializers.CharField(read_only=True, allow_null=True)
    intent = serializers.CharField(read_only=True, allow_null=True)
    model = serializers.CharField(read_only=True, allow_null=True)
    task_id = serializers.CharField(read_only=True, allow_null=True)
    status = serializers.CharField(read_only=True, allow_null=True)
    metadata = serializers.JSONField(read_only=True, default=dict)
    created_at = serializers.DateTimeField(read_only=True)
