import * as React from "react";
import { useState } from "react";
import { gsap } from "gsap";
import { useDragEvent } from "../hooks";

export const Draggable = (props) => {
  const { children, onDraging, onDragEnd } = props;
  const [isActived, setIsActived] = useState(false);

  const drag = useDragEvent(() => {
    const { active, _active } = drag;
    setIsActived(active);
    if (!_active && active) return;
    if (_active && active) onDraging(drag);
    if (_active && !active) onDragEnd(drag);
    const [x, y] = drag.movement;
    gsap.to(drag.target, {
      x: drag.active ? x : 0,
      y: drag.active ? y + 25 : 0
    });
  });

  return (
    <div style={{ cursor: isActived ? "grabbing" : "grab" }}>
      <div
        style={{
          position: "absolute",
          opacity: isActived ? 0.5 : 1
        }}
        ref={drag.ref}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          cursor: isActived ? "pointer" : "auto",
          display: isActived ? "" : "none"
        }}
      >
        {children}
      </div>
    </div>
  );
};
