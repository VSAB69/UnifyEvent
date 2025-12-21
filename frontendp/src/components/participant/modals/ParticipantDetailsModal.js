import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
} from "@mui/material";

export default function ParticipantDetailsModal({
  open,
  onClose,
  count,
  onComplete,
}) {
  const [index, setIndex] = useState(0);
  const [list, setList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    if (open) {
      setIndex(0);
      setList(
        Array.from({ length: count }, () => ({
          name: "",
          email: "",
          phone_number: "",
        }))
      );
      setForm({ name: "", email: "", phone_number: "" });
    }
  }, [open, count]);

  const saveCurrent = () => {
    const updated = [...list];
    updated[index] = { ...form };
    setList(updated);
  };

  const handleNext = () => {
    if (!form.name.trim()) return; // simple required name
    saveCurrent();
    if (index === count - 1) {
      onComplete(list.map((_, i) => (i === index ? form : list[i])));
    } else {
      const nextIdx = index + 1;
      setIndex(nextIdx);
      const next = list[nextIdx] || { name: "", email: "", phone_number: "" };
      setForm(next);
    }
  };

  const handlePrev = () => {
    if (index === 0) return;
    saveCurrent();
    const prevIdx = index - 1;
    setIndex(prevIdx);
    setForm(list[prevIdx] || { name: "", email: "", phone_number: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        Participant {index + 1} of {count}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Full Name *"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email (optional)"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone (optional)"
              fullWidth
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
            />
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary">
          We only submit to server after you finish all steps.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePrev} disabled={index === 0}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {index === count - 1 ? "Finish" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
