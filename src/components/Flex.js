import { createElement, forwardRef } from "react";

export const Flex = forwardRef((props, ref) => {
  const {
    children,
    as = "div",
    wrap = false,
    row = false,
    gap = 0,
    top = 0,
    left = 0,
    width = "100%",
    height = "100%",
    margin = 0,
    padding = 0,
    display = "flex",
    flexWrap = "nowrap",
    position = "relative",
    boxSizing = "border-box",
    overflowX = "hidden",
    overflowY = "hidden",
    alignItems = "center",
    flexDirection = "column",
    justifyContent = "center",
    ...other
  } = props;

  const style = {
    gap,
    top,
    left,
    width,
    height,
    margin,
    padding,
    display,
    flexWrap: wrap ? "wrap" : flexWrap,
    position,
    boxSizing,
    overflowX,
    overflowY,
    alignItems,
    flexDirection: row ? "row" : flexDirection,
    justifyContent,
    ...other
  };

  return createElement(as, { ref, style }, children);
});
