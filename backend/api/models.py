from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    biology_score = models.IntegerField(default=0)
    chemistry_score = models.IntegerField(default=0)
    physics_score = models.IntegerField(default=0)
    english_score = models.IntegerField(default=0)
    mathematics_score = models.IntegerField(default=0)
    economics_score = models.IntegerField(default=0)
    government_score = models.IntegerField(default=0)
    literature_score = models.IntegerField(default=0)
    total_xp = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    last_practice_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class PracticeHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    mode = models.CharField(max_length=20) # 'mock' or 'drill'
    date_taken = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject} - {self.score}/{self.total_questions}"
