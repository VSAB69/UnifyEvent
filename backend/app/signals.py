from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
from .models import Event


# ─────────────────────────────────────────────
# DELETE IMAGE WHEN EVENT IS DELETED
# ─────────────────────────────────────────────

@receiver(post_delete, sender=Event)
def delete_event_image(sender, instance, **kwargs):
    """
    Remove event image from R2 when Event is deleted
    """
    if instance.image and default_storage.exists(instance.image.name):
        default_storage.delete(instance.image.name)


# ─────────────────────────────────────────────
# DELETE OLD IMAGE WHEN IMAGE IS REPLACED
# ─────────────────────────────────────────────

@receiver(pre_save, sender=Event)
def replace_event_image(sender, instance, **kwargs):
    """
    Remove old event image from R2 when replaced
    """
    if not instance.pk:
        return  # New event

    try:
        old = Event.objects.get(pk=instance.pk)
    except Event.DoesNotExist:
        return

    if old.image and old.image != instance.image:
        if default_storage.exists(old.image.name):
            default_storage.delete(old.image.name)
