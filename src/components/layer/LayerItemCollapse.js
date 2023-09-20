import * as React from "react";

export const LayerItemCollapse = (props) => {
  const { index, isOpen, onClick } = props;
  let [w, h] = [6, 5];
  if (isOpen) [w, h] = [h, w];

  return (
    <div
      onClick={onClick}
      style={{
        width: "20px",
        height: "20px",
        display: index > 0 ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          width: w + "px",
          height: h + "px",
          clipPath: isOpen
            ? "polygon(0 0, 100% 0, 50% 100%)"
            : "polygon(0 0, 100% 50%, 0 100%)"
        }}
      />
    </div>
  );
};
