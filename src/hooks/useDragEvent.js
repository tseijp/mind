import { useState, useEffect } from "react";
import { useCall } from "./useCall";
import { event } from "reev";
import { addV, subV } from "./utils";

export const dragEvent = () => {
  const self = event({
    active: false,
    _active: false,
    value: [0, 0],
    _value: [0, 0],
    delta: [0, 0],
    offset: [0, 0],
    movement: [0, 0],
    memo: {},
    move(e) {
      self.event = e;
      self._active = self.active;
      self._value = self.value;
      self.value = [e.clientX, e.clientY];
      if (self._active) {
        self.delta = subV(self.value, self._value);
        self.offset = addV(self.offset, self.delta);
        self.movement = addV(self.movement, self.delta);
      }
      self.on(self);
    },
    down(e) {
      self.event = e;
      self._active = false;
      self.active = true;
      self.target.setPointerCapture(e.pointerId);
      self.on(self);
    },
    up(e) {
      self.event = e;
      self._active = true;
      self.active = false;
      self.target.releasePointerCapture(e.pointerId);
      self.on(self);
      self.delta = self.movement = [0, 0];
    },
    mount(target) {
      self.target = target;
      target.addEventListener("pointermove", self.move);
      target.addEventListener("pointerdown", self.down);
      target.addEventListener("pointerleave", self.up);
      target.addEventListener("pointerup", self.up);
    },
    clean() {
      const target = self.target;
      target.removeEventListener("pointermove", self.move);
      target.removeEventListener("pointerdown", self.down);
      target.removeEventListener("pointerleave", self.up);
      target.removeEventListener("pointerup", self.up);
    },
    ref(target) {
      if (target) self.mount(target);
      else self.clean();
    }
  });

  return self;
};

export const useDragEvent = (_on) => {
  const [self] = useState(dragEvent);
  const on = useCall(_on);
  useEffect(() => {
    self({ on });
    return () => void self({ on });
  });

  return self;
};
