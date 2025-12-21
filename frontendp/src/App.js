import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/useAuth";
import PrivateRoute from "./components/private_route";
import ProfilePage from "./components/home/ProfilePage";
import AdminBookingsPage from "./components/admin/AdminBookingsPage";

import AdminCheckInPage from "./components/admin/AdminCheckInPage";

// Import the NavBar layout component
import NavBar from "./components/NavBar";

import MyBookings from "./components/participant/MyBookings";
import TicketPage from "./components/participant/TicketPage";

// PUBLIC
import Login from "./routes/login";
import Register from "./routes/register";

// PRIVATE
import { Home } from "./components/home/Home";
// 1. Import the new TestsPage component

import EventGrid from "./components/admin/EventGrid";

import ParticipantEventGrid from "./components/participant/ParticipantEventGrid";
import CartPage from "./components/participant/CartPage";
import CheckoutPage from "./components/participant/CheckoutPage";

import ParentEventsPage from "./components/participant/ParentEventsPage";
import ParentEventEventsPage from "./components/participant/ParentEventEventsPage";
import BookingSuccessPage from "./components/participant/BookingSuccessPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ---------- PRIVATE ROUTES ---------- */}
          <Route
            path="/home"
            element={
              <PrivateRoute
                allowedRoles={["admin", "participant", "organiser"]}
              >
                <NavBar content={<Home />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute
                allowedRoles={["admin", "participant", "organiser"]}
              >
                <NavBar content={<ProfilePage />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/checkin/:eventId"
            element={
              <PrivateRoute allowedRoles={["admin", "organiser"]}>
                <NavBar content={<AdminCheckInPage />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/parent-events"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<ParentEventsPage />} />
              </PrivateRoute>
            }
          />
          <Route
            path="/parent/:parentId"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<ParentEventEventsPage />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/events"
            element={
              <PrivateRoute allowedRoles={["admin", "organiser", "admin"]}>
                <NavBar content={<EventGrid />} />
              </PrivateRoute>
            }
          />

          {/* PARTICIPANT EVENTS PAGE */}
          <Route
            path="/browse-events"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<ParticipantEventGrid />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<CartPage />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<MyBookings />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/ticket/:bookedEventId"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<TicketPage />} />
              </PrivateRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <NavBar content={<CheckoutPage />} />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking-success/:id"
            element={
              <PrivateRoute
                allowedRoles={["participant", "organiser", "admin"]}
              >
                <BookingSuccessPage />
              </PrivateRoute>
            }
          />

          {/* ---------- DEFAULT ROUTE ---------- */}
          {/* Redirects the base URL to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
