import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Controller } from "react-hook-form";
import FormHelperText from "@mui/material/FormHelperText";

export default function MySelectField(props) {
  const { label, placeholder, name, control, width, options } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl
          fullWidth
          sx={{
            width: { width },
          }}
        >
          <InputLabel id="demo-simple-select-label">{label}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            onChange={onChange}
            value={value}
            label="Age"
            error={!!error}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message} </FormHelperText>
        </FormControl>
      )}
    />
  );
}
