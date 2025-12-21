// src/components/admin/modals/EventModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import EventService from "../EventService";

export default function EventModal({
  open,
  onClose,
  refreshEvents,
  editEventData,
}) {
  const [categories, setCategories] = useState([]);
  const [parentEvents, setParentEvents] = useState([]);

  const [form, setForm] = useState({
    parent_committee: "",
    name: "",
    parent_event: "",
    category: "",
    price: "0",
    exclusivity: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories & parent events
  useEffect(() => {
    if (open) {
      EventService.getCategories().then((res) => setCategories(res.data));
      EventService.getParentEvents().then((res) => setParentEvents(res.data));
    }
  }, [open]);

  // Fill edit mode data
  useEffect(() => {
    if (editEventData) {
      setForm({
        parent_committee: editEventData.parent_committee,
        name: editEventData.name,
        parent_event: editEventData.parent_event || "",
        category: editEventData.category || "",
        price: editEventData.price,
        exclusivity: editEventData.exclusivity,
      });

      // Existing image preview
      if (editEventData.image) {
        setImagePreview(editEventData.image);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      setForm({
        parent_committee: "",
        name: "",
        parent_event: "",
        category: "",
        price: "0",
        exclusivity: false,
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [editEventData, open]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Create / Edit
  const handleSubmit = async () => {
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editEventData) {
        await EventService.updateEvent(editEventData.id, formData);
      } else {
        await EventService.createEvent(formData);
      }
      refreshEvents();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editEventData ? "Edit Event" : "Add New Event"}
      </DialogTitle>

      <DialogContent>
        {/* Parent Committee */}
        <TextField
          label="Parent Committee"
          fullWidth
          margin="dense"
          value={form.parent_committee}
          onChange={(e) =>
            setForm({ ...form, parent_committee: e.target.value })
          }
        />

        {/* Event Name */}
        <TextField
          label="Event Name"
          fullWidth
          margin="dense"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Parent Event */}
        <TextField
          select
          label="Parent Event"
          fullWidth
          margin="dense"
          value={form.parent_event}
          onChange={(e) => setForm({ ...form, parent_event: e.target.value })}
        >
          <MenuItem value="">None</MenuItem>
          {parentEvents.map((pe) => (
            <MenuItem key={pe.id} value={pe.id}>
              {pe.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Category */}
        <TextField
          select
          label="Category"
          fullWidth
          margin="dense"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <MenuItem value="">None</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Price */}
        <TextField
          label="Price"
          type="number"
          fullWidth
          margin="dense"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        {/* Exclusivity */}
        <FormControlLabel
          control={
            <Checkbox
              checked={form.exclusivity}
              onChange={(e) =>
                setForm({ ...form, exclusivity: e.target.checked })
              }
            />
          }
          label="Exclusive Event"
        />

        {/* —— IMAGE UPLOAD —— */}
        <Box mt={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Event Image
          </Typography>

          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>

          {/* Preview */}
          {imagePreview && (
            <Box mt={2} display="flex" justifyContent="center">
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editEventData ? "Save Changes" : "Create Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
