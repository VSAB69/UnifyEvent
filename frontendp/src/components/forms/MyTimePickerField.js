import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Controller } from "react-hook-form";

export default function MyTimePickerField(props) {
  const { label, control, name, width } = props;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["TimePicker"]}></DemoContainer>

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <TimePicker
            onChange={onChange}
            value={value}
            label={label}
            sx={{
              width: { width },
            }}
          />
        )}
      ></Controller>
    </LocalizationProvider>
  );
}
