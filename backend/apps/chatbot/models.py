from django.db import models


class ChatLogs(models.Model):
    user = models.ForeignKey('core.Users', models.DO_NOTHING, blank=True, null=True)
    platform = models.CharField(max_length=50, blank=True, null=True)
    platform_user_id = models.CharField(max_length=255, blank=True, null=True)
    message_type = models.CharField(max_length=50, blank=True, null=True)
    user_message = models.TextField(blank=True, null=True)
    bot_response = models.TextField(blank=True, null=True)
    intent = models.CharField(max_length=100, blank=True, null=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chat_logs'


class Faqs(models.Model):
    category = models.CharField(max_length=100, blank=True, null=True)
    question = models.TextField()
    answer = models.TextField()
    keywords = models.TextField(blank=True, null=True)  # This field type is a guess.
    view_count = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'faqs'


class Alerts(models.Model):
    alert_type = models.CharField(max_length=50, blank=True, null=True)
    severity = models.CharField(max_length=20, blank=True, null=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    affected_area_ids = models.TextField(blank=True, null=True)  # This field type is a guess.
    valid_from = models.DateTimeField(blank=True, null=True)
    valid_until = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'alerts'


class Notifications(models.Model):
    user = models.ForeignKey('core.Users', models.DO_NOTHING, blank=True, null=True)
    alert = models.ForeignKey('chatbot.Alerts', models.DO_NOTHING, blank=True, null=True)
    channel = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notifications'
