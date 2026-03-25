from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile, PracticeHistory
from .services import QuestionService

from django.core.mail import send_mail
from django.conf import settings
import uuid
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

class AuthView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')

            if not username or not email or not password:
                return Response({'error': 'Please provide all fields'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(username=username).first()
            if not user:
                user = User.objects.filter(email=email).first()

            if user:
                # User exists, check if they have a profile
                profile, created = Profile.objects.get_or_create(user=user)
                if not created and profile.is_verified:
                    return Response({'error': 'User already exists and is verified'}, status=status.HTTP_400_BAD_REQUEST)
                # If they exist but aren't verified, we'll just resend the token
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                profile = Profile.objects.create(user=user)

            if not profile.verification_token:
                profile.verification_token = str(uuid.uuid4())
                profile.save()
            
            # Send verification email
            try:
                verify_url = f"{settings.FRONTEND_URL}/verify-email?token={profile.verification_token}"
                print(f"Verification Link for {user.username}: {verify_url}")
                send_mail(
                    'Verify your Lambda Account',
                    f'Hi {user.username}, please verify your account by clicking here: {verify_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                print(f"Verification email queued for {user.email}")
            except Exception as e:
                print(f"Email failed: {e}")
                return Response({
                    'message': 'Registration successful! (Warning: Email failed to send, please check console for verification link)'
                }, status=status.HTTP_201_CREATED)

            return Response({
                'message': 'Registration successful! Please check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Registration error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        token = request.data.get('token')
        profile = get_object_or_404(Profile, verification_token=token)
        profile.is_verified = True
        profile.verification_token = None
        profile.save()
        return Response({'message': 'Email verified successfully!'})

    @action(detail=False, methods=['post'])
    def forgot_password(self, request):
        email = request.data.get('email')
        user = get_object_or_404(User, email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        print(f"Password Reset Link for {user.username}: {reset_url}")
        send_mail(
            'Password Reset Request',
            f'Click here to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Password reset link sent to your email.'})

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)
            
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful!'})
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')

        user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).first()
        
        if user:
            if not user.check_password(password):
                raise serializers.ValidationError({"detail": "Incorrect password. Please try again."})
            if not user.is_active:
                raise serializers.ValidationError({"detail": "This account is disabled."})
        else:
            raise serializers.ValidationError({"detail": "No account found with this username or email."})

        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class QuestionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny] # In production, use IsAuthenticated

    @action(detail=False, methods=['get'])
    def mock(self, request):
        try:
            subject = request.query_params.get('subject', 'biology')
            questions = QuestionService.get_questions(subject, mode='mock')
            return Response(questions)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def drill(self, request):
        try:
            subject = request.query_params.get('subject', 'biology')
            questions = QuestionService.get_questions(subject, mode='drill')
            return Response(questions)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        
        return Response([{
            'username': profile.user.username,
            'email': profile.user.email,
            'is_verified': profile.is_verified,
            'total_xp': profile.total_xp,
            'streak': profile.streak,
            'scores': {
                'biology': profile.biology_score,
                'chemistry': profile.chemistry_score,
                'physics': profile.physics_score,
                'english': profile.english_score,
                'mathematics': profile.mathematics_score,
                'economics': profile.economics_score,
                'government': profile.government_score,
                'literature': profile.literature_score,
            }
        }])
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        profile = self.get_queryset().first()
        if not profile:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = profile.user
        username = request.data.get('username')
        email = request.data.get('email')
        
        if username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({'detail': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username
            
        if email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'detail': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            
        user.save()
        return Response({'status': 'Profile updated'})
    
    @action(detail=False, methods=['post'])
    def save_result(self, request):
        profile = self.get_queryset().first()
        if not profile:
            profile, _ = Profile.objects.get_or_create(user=request.user)
        
        score = int(request.data.get('score', 0))
        total = int(request.data.get('total', 1))
        subject = request.data.get('subject', 'general').lower()
        mode = request.data.get('mode', 'drill')
        
        # Save history
        PracticeHistory.objects.create(
            user=request.user,
            subject=subject,
            score=score,
            total_questions=total,
            mode=mode
        )
        
        # Update Profile stats
        # More XP for Mock exams
        xp_gain = score * 20 if mode == 'mock' else score * 10
        profile.total_xp += xp_gain
        
        # Update streak
        from django.utils import timezone
        today = timezone.now().date()
        
        if not profile.last_practice_date:
            profile.streak = 1
            profile.last_practice_date = today
        elif profile.last_practice_date != today:
            if profile.last_practice_date == today - timezone.timedelta(days=1):
                profile.streak += 1
            else:
                profile.streak = 1
            profile.last_practice_date = today
            
        # Update subject accuracy (Weighted average of recent 5 tests)
        # We fetch the last 5 results for this subject
        recent_history = PracticeHistory.objects.filter(
            user=request.user, 
            subject=subject
        ).order_by('-date_taken')[:5]
        
        if recent_history.exists():
            total_score = sum([h.score for h in recent_history])
            total_qs = sum([h.total_questions for h in recent_history])
            
            if total_qs > 0:
                new_accuracy = round((total_score / total_qs) * 100)
            else:
                new_accuracy = 0
            
            # Map frontend subject names to model fields
            subject_field_map = {
                'biology': 'biology_score',
                'chemistry': 'chemistry_score',
                'physics': 'physics_score',
                'english': 'english_score',
                'mathematics': 'mathematics_score',
                'maths': 'mathematics_score',
                'economics': 'economics_score',
                'government': 'government_score',
                'literature': 'literature_score',
            }
            
            field_name = subject_field_map.get(subject)
            if field_name and hasattr(profile, field_name):
                setattr(profile, field_name, new_accuracy)
            
        profile.save()
        
        return Response({
            'status': 'Result saved',
            'xp_earned': xp_gain,
            'new_streak': profile.streak,
            'subject_accuracy': profile.biology_score if subject == 'biology' else 0 # Example
        })
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        history = PracticeHistory.objects.filter(user=request.user).order_by('-date_taken')[:10]
        data = [{
            'subject': h.subject,
            'score': h.score,
            'total': h.total_questions,
            'mode': h.mode,
            'date': h.date_taken
        } for h in history]
        return Response(data)
