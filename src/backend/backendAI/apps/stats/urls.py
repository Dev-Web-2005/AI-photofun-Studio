"""URL routes for Stats API"""

from django.urls import path
from .views import UserStatsView

urlpatterns = [
    path('', UserStatsView.as_view(), name='user-stats'),
]
