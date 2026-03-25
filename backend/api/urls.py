from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, ProfileViewSet, AuthView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', AuthView.as_view({'post': 'register'}), name='register'),
    path('auth/verify-email/', AuthView.as_view({'post': 'verify_email'}), name='verify-email'),
    path('auth/forgot-password/', AuthView.as_view({'post': 'forgot_password'}), name='forgot-password'),
    path('auth/reset-password/', AuthView.as_view({'post': 'reset_password'}), name='reset-password'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
