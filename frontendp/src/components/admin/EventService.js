import { appApiClient as AxiosInstance } from "../../api/endpoints";

const EventService = {
  // ---------- EVENTS ----------
  getAllEvents: () => AxiosInstance.get("/events/"),
  getEventById: (id) => AxiosInstance.get(`/events/${id}/`),

  // Only use multipart when uploading image
  createEvent: (data) =>
    AxiosInstance.post("/events/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateEventMultipart: (id, data) =>
    AxiosInstance.put(`/events/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // JSON update for organisers, constraints, parent_event, etc.
  updateEventJson: (id, data) => AxiosInstance.put(`/events/${id}/`, data),

  deleteEvent: (id) => AxiosInstance.delete(`/events/${id}/`),

  // ---------- ORGANISERS ----------
  getOrganisers: () => AxiosInstance.get("/organisers/"),

  // ---------- CONSTRAINTS ----------
  getConstraints: () => AxiosInstance.get("/constraints/"),
  getConstraintById: (id) => AxiosInstance.get(`/constraints/${id}/`),
  createConstraint: (data) => AxiosInstance.post("/constraints/", data),
  updateConstraint: (id, data) =>
    AxiosInstance.put(`/constraints/${id}/`, data),

  // ---------- DETAILS ----------
  getEventDetails: () => AxiosInstance.get("/event-details/"),
  getEventDetailById: (id) => AxiosInstance.get(`/event-details/${id}/`),
  createEventDetails: (data) => AxiosInstance.post("/event-details/", data),
  updateEventDetails: (id, data) =>
    AxiosInstance.put(`/event-details/${id}/`, data),

  // ---------- CATEGORIES ----------
  getCategories: () => AxiosInstance.get("/categories/"),
  getParentEvents: () => AxiosInstance.get("/parent-events/"),

  // ---------- BOOKED EVENTS ----------
  getAllBookedEventsAdmin: () => AxiosInstance.get("/booked-events/"),

  // ---------- CHECK-IN ----------
  checkInParticipant: (participantId) =>
    AxiosInstance.post(`/booked-participants/${participantId}/checkin/`),

  // ---------- SLOTS ----------
  getEventSlots: (eventId) =>
    AxiosInstance.get(`/event-slots/?event_id=${eventId}`),

  getEventSlotById: (id) => AxiosInstance.get(`/event-slots/${id}/`),
  createEventSlot: (data) => AxiosInstance.post("/event-slots/", data),
  updateEventSlot: (id, data) => AxiosInstance.put(`/event-slots/${id}/`, data),
  deleteEventSlot: (id) => AxiosInstance.delete(`/event-slots/${id}/`),
};

export default EventService;
