import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

/**
 * constraint: {
 *   booking_type: 'multiple',
 *   fixed: false,
 *   lower_limit: number,
 *   upper_limit: number
 * }
 */
export default function ParticipantCountModal({
  open,
  onClose,
  constraint,
  onChoose,
}) {
  const options = useMemo(() => {
    const low = constraint?.lower_limit || 1;
    const high = constraint?.upper_limit || 1;
    const arr = [];
    for (let i = low; i <= high; i++) arr.push(i);
    return arr;
  }, [constraint]);

  const [value, setValue] = useState(options[0] || 1);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Select Team Size</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 1 }}>
          Choose number of participants for your team.
        </Typography>
        <TextField
          select
          label="Participants"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          fullWidth
          margin="dense"
        >
          {options.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onChoose(value)}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
}
