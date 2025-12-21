import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
} from "@mui/material";
import EventService from "../EventService";

export default function EventSlotModal({
  open,
  onClose,
  eventId,
  slotId,
  refreshList,
}) {
  const editMode = Boolean(slotId);

  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    unlimited_participants: true,
    max_participants: "",
    booked_participants: "0",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (editMode) {
      EventService.getEventSlotById(slotId).then((res) => {
        const s = res.data;
        setForm({
          date: s.date || "",
          start_time: s.start_time?.slice(0, 5) || "",
          end_time: s.end_time?.slice(0, 5) || "",
          unlimited_participants: !!s.unlimited_participants,
          max_participants: s.max_participants ?? "",
          booked_participants: String(s.booked_participants ?? "0"),
        });
      });
    } else {
      setForm({
        date: "",
        start_time: "",
        end_time: "",
        unlimited_participants: true,
        max_participants: "",
        booked_participants: "0",
      });
    }
  }, [slotId, open]); // reset each open or slot change

  const validateTimes = () => {
    if (!form.start_time || !form.end_time) return true;
    // simple string compare works for HH:mm
    return form.end_time > form.start_time;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateTimes()) {
      setError("End time must be after start time.");
      return;
    }

    const payload = {
      event: eventId,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      unlimited_participants: form.unlimited_participants,
      max_participants:
        form.unlimited_participants || form.max_participants === ""
          ? null
          : Number(form.max_participants),
      booked_participants:
        form.booked_participants === "" ? 0 : Number(form.booked_participants),
    };

    if (editMode) {
      await EventService.updateEventSlot(slotId, payload);
    } else {
      await EventService.createEventSlot(payload);
    }

    await refreshList();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{editMode ? "Edit Slot" : "Add Slot"}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="End Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              error={!!form.end_time && !validateTimes()}
              helperText={
                !!form.end_time && !validateTimes()
                  ? "End must be after start"
                  : ""
              }
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.unlimited_participants}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unlimited_participants: e.target.checked,
                    })
                  }
                />
              }
              label="Unlimited participants"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Max Participants"
              type="number"
              fullWidth
              disabled={form.unlimited_participants}
              value={form.max_participants}
              onChange={(e) =>
                setForm({ ...form, max_participants: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Booked Participants"
              type="number"
              fullWidth
              value={form.booked_participants}
              onChange={(e) =>
                setForm({ ...form, booked_participants: e.target.value })
              }
              helperText="(Manually editable, availability auto-recomputed)"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editMode ? "Save Changes" : "Add Slot"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
