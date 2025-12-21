// src/components/admin/modals/EventDetailsModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import EventService from "../EventService";

export default function EventDetailsModal({
  open,
  onClose,
  eventId,
  detailsId,
  refreshEvents,
}) {
  const [form, setForm] = useState({
    description: "",
    venue: "",
    start_datetime: "",
    end_datetime: "",
  });

  useEffect(() => {
    if (detailsId) {
      EventService.getEventDetailById(detailsId).then((res) => {
        const d = res.data;
        setForm({
          description: d.description || "",
          venue: d.venue || "",
          start_datetime: d.start_datetime?.slice(0, 16) || "",
          end_datetime: d.end_datetime?.slice(0, 16) || "",
        });
      });
    }
  }, [detailsId]);

  const handleSubmit = async () => {
    const payload = { event: eventId, ...form };

    if (detailsId) await EventService.updateEventDetails(detailsId, payload);
    else await EventService.createEventDetails(payload);

    refreshEvents();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{detailsId ? "Edit Details" : "Add Details"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <TextField
          label="Venue"
          fullWidth
          margin="dense"
          value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
        />
        <TextField
          label="Start Date & Time"
          type="datetime-local"
          fullWidth
          margin="dense"
          value={form.start_datetime}
          onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
        />
        <TextField
          label="End Date & Time"
          type="datetime-local"
          fullWidth
          margin="dense"
          value={form.end_datetime}
          onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
