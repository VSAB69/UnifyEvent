// src/components/participant/modals/SlotPickModal.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
} from "@mui/material";

export default function SlotPickModal({
  open,
  onClose,
  event,
  participantsCount,
  onPick,
  fetchSlots,
}) {
  const [slots, setSlots] = useState([]);
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const res = await fetchSlots(event.id);
      setSlots(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setValue(null);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id]);

  const selected = slots.find((s) => String(s.id) === String(value));

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Pick a Time Slot</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Loading slots…</Typography>
        ) : slots.length === 0 ? (
          <Typography color="text.secondary">No slots found.</Typography>
        ) : (
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
            <List dense>
              {slots.map((s) => {
                const canFit =
                  s.unlimited_participants ||
                  (s.available_participants ?? 0) >= participantsCount;

                return (
                  <ListItem
                    key={s.id}
                    button
                    onClick={() => (canFit ? setValue(String(s.id)) : null)}
                    disabled={!canFit}
                  >
                    <FormControlLabel
                      value={String(s.id)}
                      control={<Radio disabled={!canFit} />}
                      label={
                        <ListItemText
                          primary={`${s.date} — ${s.start_time} to ${s.end_time}`}
                          secondary={
                            s.unlimited_participants
                              ? "Unlimited capacity"
                              : canFit
                              ? `Available: ${s.available_participants}`
                              : `Available: ${s.available_participants} (Not enough capacity)`
                          }
                        />
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </RadioGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selected}
          onClick={() => onPick(selected)}
        >
          Confirm Slot
        </Button>
      </DialogActions>
    </Dialog>
  );
}
