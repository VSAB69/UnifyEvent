from django.contrib import admin
from .models import *


@admin.register(Organiser)
class OrganiserAdmin(admin.ModelAdmin):
    list_display = ['user']
    search_fields = ['user__username', 'user__email']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(ParentEvent)
class ParentEventAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class EventDetailsInline(admin.StackedInline):
    model = EventDetails
    can_delete = False
    extra = 0


class ParticipationConstraintInline(admin.StackedInline):
    model = ParticipationConstraint
    can_delete = False
    extra = 0


class EventSlotInline(admin.TabularInline):
    """
    Show slots under the event page itself to easily manage from admin.
    """
    model = EventSlot
    extra = 0
    fields = ('date', 'start_time', 'end_time', 'unlimited_participants', 'max_participants',
              'booked_participants', 'available', 'available_participants')
    readonly_fields = ('available', 'available_participants')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent_committee', 'category', 'price', 'exclusivity']
    search_fields = ['name', 'parent_committee']
    list_filter = ['category', 'exclusivity']

    filter_horizontal = ['organisers']  # nice multi-select UI

    inlines = [
        EventDetailsInline,
        ParticipationConstraintInline,
        EventSlotInline,
    ]


# CART & BOOKING MODELS
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'owner', 'is_active', 'created_at']
    search_fields = ['owner__username', 'owner__email']
    list_filter = ['is_active', 'created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart', 'event', 'participants_count', 'created_at']
    search_fields = ['event__name', 'cart__owner__username', 'cart__owner__email']


@admin.register(TempBook)
class TempBookAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart_item', 'name', 'email', 'phone_number']
    search_fields = ['name', 'email', 'phone_number']


@admin.register(TempBookTimeslot)
class TempBookTimeslotAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart_item', 'slot']
    search_fields = ['slot__event__name']


# events/admin.py (append)



@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "payment_status", "total_amount", "created_at"]
    list_filter = ["status", "payment_status", "created_at"]
    search_fields = ["user__username", "user__email", "id"]

@admin.register(BookedEvent)
class BookedEventAdmin(admin.ModelAdmin):
    list_display = ["id", "booking", "event", "participants_count", "unit_price", "line_total", "slot"]
    list_filter = ["event"]
    search_fields = ["booking__id", "event__name"]

@admin.register(BookedParticipant)
class BookedParticipantAdmin(admin.ModelAdmin):
    list_display = ["id", "booking", "booked_event", "name", "arrived", "checkin_time"]
    list_filter = ["arrived"]
    search_fields = ["name", "booking__id", "booked_event__id"]

