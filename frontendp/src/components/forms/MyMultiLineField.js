import * as React from "react";
import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

export default function MyMultiLineField(props) {
  const { label, placeholder, name, width, control } = props;
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: error,
        formState,
      }) => (
        <TextField
          id="outlined-multiline-static"
          sx={{
            width: { width },
          }}
          onChange={onChange}
          value={value}
          label={label}
          multiline
          rows={1}
          placeholder={placeholder}
        />
      )}
    ></Controller>
  );
}
