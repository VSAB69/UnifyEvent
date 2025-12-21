# events/urls.py

from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register('organisers', OrganiserViewSet)
router.register('categories', CategoryViewSet)
router.register('parent-events', ParentEventViewSet)
router.register('events', EventViewSet)
router.register('constraints', ParticipationConstraintViewSet)
router.register('event-details', EventDetailsViewSet)
router.register('event-slots', EventSlotViewSet)
router.register("cart", CartViewSet, basename="cart")
router.register("cartitems", CartItemViewSet, basename="cartitems")
router.register("tempbookings", TempBookViewSet, basename="tempbookings")
router.register("temp-timeslots", TempBookTimeslotViewSet, basename="temp-timeslots")
router.register("booked-participants", BookedParticipantViewSet, basename="booked-participants")
router.register("bookings", BookingViewSet, basename="bookings")
router.register("booked-events", BookedEventViewSet, basename="booked-events")




urlpatterns = router.urls
