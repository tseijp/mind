import * as React from "react";
import { forwardRef } from "react";

export const Field = forwardRef((props, ref) => {
  const {
    value,
    onChange,
    width = "100%",
    height = "100%",
    margin = 0,
    padding = 0,
    border = "none",
    outline = "none",
    fontSize = "inherit",
    background = "none",
    fontFamily = "inherit",
    ...other
  } = props;
  const style = {
    width,
    height,
    margin,
    padding,
    border,
    outline,
    fontSize,
    background,
    fontFamily,
    ...other
  };
  return (
    <input ref={ref} style={style} defaultValue={value} onChange={onChange} />
  );
});
