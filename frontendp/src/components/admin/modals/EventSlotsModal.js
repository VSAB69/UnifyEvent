import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EventService from "../EventService";
import EventSlotModal from "./EventSlotModal";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EventSlotsListModal({
  open,
  onClose,
  eventId,
  eventName,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotIdToEdit, setSlotIdToEdit] = useState(null);

  const fetchSlots = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await EventService.getEventSlots(eventId);
      setSlots(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchSlots();
  }, [open, eventId]);

  const openAddSlot = () => {
    setSlotIdToEdit(null);
    setSlotModalOpen(true);
  };

  const openEditSlot = (slotId) => {
    setSlotIdToEdit(slotId);
    setSlotModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          Manage Slots — {eventName || `Event #${eventId}`}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="contained" onClick={openAddSlot}>
              Add Slot
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : slots.length === 0 ? (
            <Typography color="text.secondary">No slots yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.start_time}</TableCell>
                    <TableCell>{s.end_time}</TableCell>
                    <TableCell>
                      {s.unlimited_participants
                        ? "Unlimited"
                        : `Max ${s.max_participants}`}
                    </TableCell>
                    <TableCell align="right">
                      {s.unlimited_participants
                        ? "—"
                        : s.available_participants}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openEditSlot(s.id)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={async () => {
                          if (window.confirm("Delete this slot?")) {
                            await EventService.deleteEventSlot(s.id);
                            fetchSlots(); // refresh
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <EventSlotModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        eventId={eventId}
        slotId={slotIdToEdit}
        refreshList={fetchSlots}
      />
    </>
  );
}
