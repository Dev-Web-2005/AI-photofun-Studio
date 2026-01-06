import uuid
from django.db import models
from django.utils import timezone


class VideoGallery(models.Model):
    """
    Stores user-generated videos with metadata.
    Uses UUID as primary key for video identification.
    """
    video_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="UUID for video identification"
    )
    user_id = models.CharField(
        max_length=255,
        db_index=True,
        help_text="User identifier"
    )
    video_url = models.URLField(
        max_length=1024,
        blank=True,
        null=True,
        help_text="Full URL of the video"
    )
    prompt = models.TextField(
        blank=True,
        null=True,
        help_text="Prompt used for video generation"
    )
    intent = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Generation intent (e.g., prompt_to_video, image_to_video)"
    )
    model = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Video generation model name"
    )
    task_id = models.CharField(
        max_length=255,
        unique=True,
        blank=True,
        null=True,
        help_text="Model Studio task identifier"
    )
    status = models.CharField(
        max_length=50,
        default='PROCESSING',
        help_text="Task status (PROCESSING, SUCCEEDED, FAILED, etc.)"
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional metadata (duration, input_image_url, etc.)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp when video was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last update"
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Soft delete timestamp; null if not deleted"
    )

    class Meta:
        db_table = 'video_gallery'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', '-created_at']),
            models.Index(fields=['user_id', 'deleted_at']),
            models.Index(fields=['task_id']),
        ]

    def __str__(self):
        return f"{self.user_id} - {self.video_id}"

    def soft_delete(self):
        """Mark video as deleted without removing from database."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at', 'updated_at'])

    def restore(self):
        """Restore a soft-deleted video."""
        self.deleted_at = None
        self.save(update_fields=['deleted_at', 'updated_at'])

    @property
    def is_deleted(self):
        """Check if video is soft-deleted."""
        return self.deleted_at is not None
