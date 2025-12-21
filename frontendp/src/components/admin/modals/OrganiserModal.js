import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Checkbox,
  Typography,
  Stack,
} from "@mui/material";
import EventService from "../EventService";

export default function OrganiserModal({
  open,
  onClose,
  eventId,
  currentOrganiserIds,
  refreshEvents,
}) {
  const [allOrganisers, setAllOrganisers] = useState([]);
  const [assigned, setAssigned] = useState([]); // left side ids
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      EventService.getOrganisers().then((res) => {
        setAllOrganisers(res.data);
        setAssigned(currentOrganiserIds || []);
      });
    }
  }, [open]);

  const handleAdd = (o) => {
    if (!assigned.includes(o.id)) {
      setAssigned([...assigned, o.id]);
    }
  };

  const handleRemoveToggle = (o) => {
    if (assigned.includes(o.id)) {
      setAssigned(assigned.filter((id) => id !== o.id));
    } else {
      setAssigned([...assigned, o.id]);
    }
  };

  const filtered = allOrganisers.filter((o) =>
    o.user_display.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    await EventService.updateEventJson(eventId, { organisers: assigned });
    refreshEvents();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Manage Organisers</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 4 }}>
          {/* LEFT SIDE */}
          <Box sx={{ width: "50%", borderRight: "1px solid #ccc", pr: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Assigned Organisers
            </Typography>

            {allOrganisers
              .filter((o) => assigned.includes(o.id))
              .map((o) => (
                <Box
                  key={o.id}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Checkbox
                    checked={true}
                    onChange={() => handleRemoveToggle(o)}
                  />
                  <Typography>{o.user_display}</Typography>
                </Box>
              ))}

            {assigned.length === 0 && (
              <Typography color="text.secondary">
                No organisers assigned
              </Typography>
            )}
          </Box>

          {/* RIGHT SIDE */}
          <Box sx={{ width: "50%", pl: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Available Organisers
            </Typography>

            <TextField
              fullWidth
              placeholder="Search organisers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            {filtered.map((o) => (
              <Box
                key={o.id}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Typography sx={{ flex: 1 }}>{o.user_display}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdd(o)}
                >
                  Add
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
