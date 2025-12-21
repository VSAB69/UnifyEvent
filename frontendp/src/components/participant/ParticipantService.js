import { appApiClient } from "../../api/endpoints";

const ParticipantService = {
  // ------------------------------------
  // EVENTS
  // ------------------------------------
  getAllEvents: () => appApiClient.get("/events/browse/"),
  getConstraintById: (id) => appApiClient.get(`/constraints/${id}/`),
  getConstraintForEvent: (eventId) =>
    appApiClient.get(`/constraints/?event=${eventId}`),

  // ------------------------------------
  // SLOTS
  // ------------------------------------
  getEventSlots: (eventId) =>
    appApiClient.get(`/event-slots/?event_id=${eventId}`),
  getEventSlotById: (id) => appApiClient.get(`/event-slots/${id}/`),

  // ------------------------------------
  // CART
  // ------------------------------------
  getOrCreateCart: () => appApiClient.get("/cart/"),
  getCart: () => appApiClient.get("/cart/"),
  createCartItem: (data) => appApiClient.post("/cartitems/", data),
  updateCartItem: (id, data) => appApiClient.patch(`/cartitems/${id}/`, data),
  deleteCartItem: (id) => appApiClient.delete(`/cartitems/${id}/`),

  // ------------------------------------
  // TEMP PARTICIPANTS
  // ------------------------------------
  createTempBooking: (data) => appApiClient.post("/tempbookings/", data),
  updateTempBooking: (id, data) =>
    appApiClient.patch(`/tempbookings/${id}/`, data),
  deleteTempBooking: (id) => appApiClient.delete(`/tempbookings/${id}/`),

  // ------------------------------------
  // TEMP TIMESLOT
  // ------------------------------------
  createTempTimeslot: (data) => appApiClient.post("/temp-timeslots/", data),
  updateTempTimeslot: (id, data) =>
    appApiClient.patch(`/temp-timeslots/${id}/`, data),
  deleteTempTimeslot: (id) => appApiClient.delete(`/temp-timeslots/${id}/`),

  // ------------------------------------
  // BOOKINGS
  // ------------------------------------
  getMyBookings: () => appApiClient.get("/bookings/"),
  placeBooking: () => appApiClient.post("/bookings/place/"),
  getBookedEvent: (bookedEventId) =>
    appApiClient.get(`/booked-events/${bookedEventId}/`),

  // ------------------------------------
  // EVENT DETAILS
  // ------------------------------------
  getEventDetailsByEvent: (eventId) =>
    appApiClient.get(`/event-details/?event=${eventId}`),

  // ------------------------------------
  // ⭐ NEW — PARENT EVENTS (for category pages)
  // ------------------------------------
  getParentEvents: () => appApiClient.get("/parent-events/"),

  getParentEvent: (id) => appApiClient.get(`/parent-events/${id}/`),

  // Filter events belonging to a parent
  getEventsByParent: (parentId) =>
    appApiClient.get(`/events/browse/?parent_event=${parentId}`),
};

export default ParticipantService;
