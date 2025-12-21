import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import EventService from "../EventService";

export default function ParticipationConstraintModal({
  open,
  onClose,
  eventId,
  constraintId,
  refreshEvents,
}) {
  const [form, setForm] = useState({
    booking_type: "single",
    fixed: false,
    lower_limit: "",
    upper_limit: "",
  });

  useEffect(() => {
    if (constraintId) {
      EventService.getConstraintById(constraintId).then((res) => {
        const c = res.data;
        setForm({
          booking_type: c.booking_type,
          fixed: c.fixed,
          lower_limit: c.lower_limit ?? "",
          upper_limit: c.upper_limit ?? "",
        });
      });
    } else {
      setForm({
        booking_type: "single",
        fixed: false,
        lower_limit: "",
        upper_limit: "",
      });
    }
  }, [constraintId, open]);

  const handleSubmit = async () => {
    let payload = { event: eventId, booking_type: form.booking_type };

    if (form.booking_type === "single") {
      payload.fixed = false;
      payload.lower_limit = null;
      payload.upper_limit = null;
    } else if (form.fixed) {
      payload.fixed = true;
      payload.lower_limit = null;
      payload.upper_limit = Number(form.upper_limit);
    } else {
      payload.fixed = false;
      payload.lower_limit = Number(form.lower_limit);
      payload.upper_limit = Number(form.upper_limit);
    }

    try {
      if (constraintId) {
        await EventService.updateConstraint(constraintId, payload);
      } else {
        await EventService.createConstraint(payload);
      }
    } catch (err) {
      // fallback: event already has constraint -> find it then update
      const list = await EventService.getConstraints();
      const existing = list.data.find((c) => c.event === eventId);
      if (existing) {
        await EventService.updateConstraint(existing.id, payload);
      } else {
        throw err;
      }
    }

    refreshEvents();
    onClose();
  };

  const disableLogic = {
    fixedDisabled: form.booking_type === "single",
    lowerDisabled:
      form.booking_type === "single" ||
      (form.booking_type === "multiple" && form.fixed),
    upperDisabled: form.booking_type === "single",
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {constraintId
          ? "Edit Participation Constraints"
          : "Add Participation Constraints"}
      </DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Booking Type"
          fullWidth
          margin="dense"
          value={form.booking_type}
          onChange={(e) => setForm({ ...form, booking_type: e.target.value })}
        >
          <MenuItem value="single">Single</MenuItem>
          <MenuItem value="multiple">Multiple</MenuItem>
        </TextField>

        <FormControlLabel
          control={
            <Checkbox
              checked={form.fixed}
              disabled={disableLogic.fixedDisabled}
              onChange={(e) => setForm({ ...form, fixed: e.target.checked })}
            />
          }
          label="Fixed"
        />

        <TextField
          label="Lower Limit"
          type="number"
          disabled={disableLogic.lowerDisabled}
          fullWidth
          margin="dense"
          value={form.lower_limit}
          onChange={(e) => setForm({ ...form, lower_limit: e.target.value })}
        />

        <TextField
          label="Upper Limit"
          type="number"
          disabled={disableLogic.upperDisabled}
          fullWidth
          margin="dense"
          value={form.upper_limit}
          onChange={(e) => setForm({ ...form, upper_limit: e.target.value })}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Constraints
        </Button>
      </DialogActions>
    </Dialog>
  );
}
