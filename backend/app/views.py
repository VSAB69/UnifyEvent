from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import *
from .serializers import *
class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer

    # IMPORTANT — restore base queryset so router works
    queryset = Event.objects.all()

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['parent_event']

    # ⭐ ALWAYS annotate and prefetch required relations
    def get_base_queryset(self):
        return (
            Event.objects
            .select_related(
                "constraint",
                "details",
                "parent_event",
                "category",
            )
            .prefetch_related("slots", "organisers")
        )

    def get_queryset(self):
        user = self.request.user
        qs = self.get_base_queryset()

        if user.role == 'admin':
            return qs

        if user.role == 'organiser':
            return qs.filter(organisers__user=user)

        if user.role == 'participant':
            return qs

        return Event.objects.none()


    # ---------------------------
    # /events/browse/
    # ---------------------------
    @action(detail=False, methods=['get'], url_path='browse', permission_classes=[IsAuthenticated])
    def browse(self, request):
        user = request.user
        qs = self.get_base_queryset()

        # organisers cannot participate in their own events
        if user.role == 'organiser':
            qs = qs.exclude(organisers__user=user)

        # optional parent filter
        parent_event = request.query_params.get("parent_event")
        if parent_event:
            qs = qs.filter(parent_event=parent_event)

        # only fully configured events
        qs = qs.filter(
            constraint__isnull=False,
            details__isnull=False,
            slots__isnull=False,
        ).distinct()

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can create events"}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can delete events"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)




# views.py
from rest_framework.permissions import SAFE_METHODS

class EventSlotViewSet(viewsets.ModelViewSet):
    queryset = EventSlot.objects.all()
    serializer_class = EventSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event', 'date', 'available']

    def get_queryset(self):
        qs = EventSlot.objects.all()
        event_id = self.request.query_params.get("event_id")
        date = self.request.query_params.get("date")
        if event_id:
            qs = qs.filter(event_id=event_id)
        if date:
            qs = qs.filter(date=date)

        user = self.request.user

        # READ: allow participant & organiser to see all
        if self.request.method in SAFE_METHODS:
            return qs

        # WRITE: admin all; organiser only their events
        if user.role == "admin":
            return qs
        if user.role == "organiser":
            return qs.filter(event__organisers__user=user)
        return EventSlot.objects.none()



class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ParentEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ParentEvent.objects.all()
    serializer_class = ParentEventSerializer


class ParticipationConstraintViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ParticipationConstraintSerializer
    queryset = ParticipationConstraint.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event']

    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can create constraints"}, status=403)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin' and request.user.role != 'organiser':
            kwargs['partial'] = True
            return Response({"detail": "No permission to update constraints"}, status=403)
        return super().update(request, *args, **kwargs)



    def get_queryset(self):
        user = self.request.user

        # everyone logged in can READ constraints
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return ParticipationConstraint.objects.all()

        # write access rules
        if user.role == 'admin':
            return ParticipationConstraint.objects.all()

        if user.role == 'organiser':
            return ParticipationConstraint.objects.filter(event__organisers__user=user)

        return ParticipationConstraint.objects.none()




class EventDetailsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EventDetailsSerializer
    queryset = EventDetails.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event']

    def get_queryset(self):
        user = self.request.user

        # READ operations
        if self.request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return EventDetails.objects.all()

        # WRITE operations
        if user.role == 'admin':
            return EventDetails.objects.all()

        if user.role == 'organiser':
            return EventDetails.objects.filter(event__organisers__user=user)

        return EventDetails.objects.none()




class OrganiserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Organiser.objects.all()
    serializer_class = OrganiserSerializer




class IsOwnerOnly(permissions.BasePermission):
    """Allow access only to the owner of the cart (and its related objects)."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if isinstance(obj, Cart):
            return obj.owner_id == user.id
        if isinstance(obj, CartItem):
            return obj.cart.owner_id == user.id
        if isinstance(obj, TempBook):
            return obj.cart_item.cart.owner_id == user.id
        if isinstance(obj, TempBookTimeslot):
            return obj.cart_item.cart.owner_id == user.id
        return False


class CartViewSet(viewsets.ModelViewSet):
    """
    We expose list to return/create the user's active cart.
    - GET /cart/   -> return (and auto-create) the current user's active cart (single object)
    - POST /cart/  -> create an active cart if none (optional in this flow)
    """
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users see only their carts
        return Cart.objects.filter(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(owner=request.user, is_active=True)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Optional: ensure a single active cart
        cart, created = Cart.objects.get_or_create(owner=request.user, is_active=True)
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOnly]

    def get_queryset(self):
        # Only items belonging to current user's carts
        return CartItem.objects.filter(cart__owner=self.request.user)

    def perform_create(self, serializer):
        cart = serializer.validated_data.get("cart", None)
        event = serializer.validated_data.get("event")
        user = self.request.user

        if cart is None:
            cart, _ = Cart.objects.get_or_create(owner=user, is_active=True)
        else:
            if cart.owner_id != user.id:
                raise permissions.PermissionDenied("You cannot add items to another user's cart.")

        # 🚫 organisers cannot add their own events
        if user.role == 'organiser' and Organiser.objects.filter(user=user, events=event).exists():
            raise ValidationError("Organisers cannot participate in their own event.")

        serializer.save(cart=cart)


class TempBookViewSet(viewsets.ModelViewSet):
    """
    Create one row per participant. Prevent exceeding participants_count.
    """
    serializer_class = TempBookSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOnly]

    def get_queryset(self):
        return TempBook.objects.filter(cart_item__cart__owner=self.request.user)

    def perform_create(self, serializer):
        cart_item = serializer.validated_data["cart_item"]
        if cart_item.cart.owner_id != self.request.user.id:
            raise permissions.PermissionDenied("Not your cart item.")
        # Enforce count limit
        current = cart_item.temp_participants.count()
        if current >= cart_item.participants_count:
            raise ValidationError("You have already provided all required participant details.")
        serializer.save()


class TempBookTimeslotViewSet(viewsets.ModelViewSet):
    serializer_class = TempBookTimeslotSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOnly]

    def get_queryset(self):
        return TempBookTimeslot.objects.filter(cart_item__cart__owner=self.request.user)

    def perform_create(self, serializer):
        cart_item = serializer.validated_data["cart_item"]
        if cart_item.cart.owner_id != self.request.user.id:
            raise permissions.PermissionDenied("Not your cart item.")

        # Business rule: slot must have capacity for the entire team if limited
        slot = serializer.validated_data["slot"]
        if slot.event_id != cart_item.event_id:
            raise ValidationError("Slot does not belong to this event.")
        if not slot.unlimited_participants:
            needed = cart_item.participants_count
            if slot.available_participants is None or slot.available_participants < needed:
                raise ValidationError("Selected slot does not have enough capacity.")

        serializer.save()




# events/views.py (append)

from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Booking, BookedEvent, BookedParticipant,
    Cart, CartItem, TempBook, TempBookTimeslot, EventSlot
)
from .serializers import BookingSerializer


class IsBookingOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id


class BookingViewSet(viewsets.ModelViewSet):
    """
    - GET /bookings/          -> list user's bookings
    - GET /bookings/<id>/     -> detail
    - POST /bookings/place/   -> convert active cart -> booking
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by("-created_at")

    @action(detail=False, methods=["post"], url_path="place")
    @transaction.atomic
    def place(self, request):
        user = request.user

        # 1) Load active cart
        try:
            cart = Cart.objects.select_related("owner").prefetch_related(
                "items__event",
                "items__temp_participants",
                "items__temp_timeslot__slot",
            ).get(owner=user, is_active=True)
        except Cart.DoesNotExist:
            return Response({"detail": "No active cart found."}, status=status.HTTP_400_BAD_REQUEST)

        items = list(cart.items.all())
        if not items:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 2) Validate each item has slot and participant details correct
        for it in items:
            # require slot
            if not hasattr(it, "temp_timeslot") or it.temp_timeslot is None:
                return Response(
                    {"detail": f"Event '{it.event.name}' has no selected slot."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # participants count matches rows
            if it.temp_participants.count() != it.participants_count:
                return Response(
                    {"detail": f"Event '{it.event.name}' participant details are incomplete."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3) Capacity check for all limited slots
        #    (We also decrement inside the loop to avoid race; wrapped in atomic)
        #    We'll re-fetch with select_for_update() to lock rows.
        #    Build a dict: slot_id -> required_sum
        slot_required = {}
        for it in items:
            slot_id = it.temp_timeslot.slot_id
            slot_required[slot_id] = slot_required.get(slot_id, 0) + it.participants_count

        # lock slots
        locked_slots = (
            EventSlot.objects.select_for_update()
            .filter(id__in=slot_required.keys())
        )
        slots_by_id = {s.id: s for s in locked_slots}

        for sid, needed in slot_required.items():
            s = slots_by_id[sid]
            if not s.unlimited_participants:
                if s.available_participants is None or s.available_participants < needed:
                    return Response(
                        {"detail": f"Slot {s.date} {s.start_time}-{s.end_time} doesn't have enough capacity."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # 4) Create booking + lines; decrement capacity; copy participants
        booking = Booking.objects.create(user=user, status="confirmed", payment_status=None, total_amount=0)

        total = 0
        for it in items:
            slot = slots_by_id[it.temp_timeslot.slot_id]
            unit = it.event.price
            line_total = unit * it.participants_count

            be = BookedEvent.objects.create(
                booking=booking,
                event=it.event,
                slot=slot,
                participants_count=it.participants_count,
                unit_price=unit,
                line_total=line_total,
            )
            total += line_total

            # participants
            for p in it.temp_participants.all():
                BookedParticipant.objects.create(
                    booking=booking,
                    booked_event=be,
                    name=p.name,
                    email=p.email,
                    phone_number=p.phone_number,
                    arrived=False,
                    checkin_time=None,
                )

            # decrement capacity & save
            if not slot.unlimited_participants:
                slot.booked_participants += it.participants_count
            slot.save()  # will recompute available_participants & available

        # 5) finalize booking total and deactivate cart
        booking.total_amount = total
        booking.save(update_fields=["total_amount"])

        cart.is_active = False
        cart.save(update_fields=["is_active"])

        # (Optional) you can delete temp rows; I suggest to keep for audit or clear here:
        # TempBook.objects.filter(cart_item__cart=cart).delete()
        # TempBookTimeslot.objects.filter(cart_item__cart=cart).delete()

        ser = BookingSerializer(booking)
        return Response(ser.data, status=status.HTTP_201_CREATED)

class BookedParticipantViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = BookedParticipant.objects.all()

    def get_serializer_class(self):
        if self.action == "checkin":
            return BookedParticipantCheckinSerializer
        return BookedParticipantSerializer

    # permission check
    def has_permission_on_obj(self, request, participant):
        user = request.user
        if user.role == "admin":
            return True
        if user.role == "organiser":
            return participant.booked_event.event.organisers.filter(user=user).exists()
        return False

    # SINGLE VALID CHECKIN ENDPOINT (no duplicates)
    @action(detail=True, methods=["post"], url_path="checkin")
    def checkin(self, request, pk=None):
        participant = self.get_object()

        if not self.has_permission_on_obj(request, participant):
            return Response({"detail": "Not allowed"}, status=403)

        serializer = BookedParticipantCheckinSerializer(
            participant,
            data={"arrived": True},
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        participant.arrived = True
        participant.checkin_time = timezone.now()
        participant.save(update_fields=["arrived", "checkin_time"])

        return Response({"detail": "Checked-in"}, status=200)




# --- at top with other imports ---
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

# add near other viewsets
class BookedEventViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = BookedEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin sees ALL
        if user.role == "admin":
            return BookedEvent.objects.all()

        # Organiser sees:
        # 1) events they organised
        # 2) AND bookings they personally made
        if user.role == "organiser":
            return BookedEvent.objects.filter(
                models.Q(event__organisers__user=user) |
                models.Q(booking__user=user)
            ).distinct()

        # Participant sees ONLY their bookings
        return BookedEvent.objects.filter(booking__user=user)


