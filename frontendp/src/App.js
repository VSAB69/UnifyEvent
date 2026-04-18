import React, { useMemo } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import { AuthProvider } from "./context/useAuth";
import PrivateRoute from "./components/private_route";
import ProfilePage from "./components/home/ProfilePage";
import AdminCheckInPage from "./components/admin/AdminCheckInPage";
import NavBar from "./components/NavBar";
import MyBookings from "./components/participant/MyBookings";
import TicketPage from "./components/participant/TicketPage";
import Login from "./routes/login";
import Register from "./routes/register";
import { Home } from "./components/home/Home";
import EventGrid from "./components/admin/EventGrid";
import CartPage from "./components/participant/CartPage";
import CheckoutPage from "./components/participant/CheckoutPage";
import ParentEventsPage from "./components/participant/ParentEventsPage";
import ParentEventEventsPage from "./components/participant/ParentEventEventsPage";
import BookingSuccessPage from "./components/participant/BookingSuccessPage";
import EventDetailsPage from "./components/participant/EventDetailsPage";

function App() {
  // Define role groups for better scalability
  const allUsers = useMemo(() => ["admin", "participant", "organiser"], []);
  const adminOrganiser = useMemo(() => ["admin", "organiser"], []);
  const participantsOnly = useMemo(() => ["participant", "organiser", "admin"], []); // Usually participants + staff

  return (
    <ChakraProvider>
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
                <PrivateRoute allowedRoles={allUsers}>
                  <NavBar content={<Home />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={allUsers}>
                  <NavBar content={<ProfilePage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/checkin/:eventId"
              element={
                <PrivateRoute allowedRoles={adminOrganiser}>
                  <NavBar content={<AdminCheckInPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/parent-events"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<ParentEventsPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/parent/:parentId"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<ParentEventEventsPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/event/:eventId"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<EventDetailsPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/events"
              element={
                <PrivateRoute allowedRoles={adminOrganiser}>
                  <NavBar content={<EventGrid />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<CartPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<MyBookings />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/ticket/:bookedEventId"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<TicketPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <NavBar content={<CheckoutPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/booking-success/:id"
              element={
                <PrivateRoute allowedRoles={participantsOnly}>
                  <BookingSuccessPage />
                </PrivateRoute>
              }
            />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* Catch All - 404/Redirect */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;