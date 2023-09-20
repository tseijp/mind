import { useState, useEffect } from "react";
import event from "reev";
import { useCall } from "./useCall";
import { addV, wheelValues } from "./utils";

export const wheelEvent = () => {
  const self = event({
    active: false,
    _active: false,
    value: [0, 0],
    _value: [0, 0],
    delta: [0, 0],
    offset: [0, 0],
    movement: [0, 0],
    wheel(e) {
      e.preventDefault();
      self.e = e;
      self._active = self.active;
      self._value = self.value;
      self.active = true;
      self.delta = wheelValues(e);
      if (self._active) {
        self.offset = addV(self.offset, self.delta);
        self.movement = addV(self.movement, self.delta);
      }
      const id = setTimeout(self.end, 1000);
      const scroll = () => {
        self({ scroll });
        clearTimeout(id);
      };
      self({ scroll });
      self.on(self);
    },
    end(_e) {
      self._active = !(self.active = false);
      self.delta = self.movement = [0, 0];
      self.on(self);
    },
    mount(target) {
      self.target = target;
      target.addEventListener("wheel", self.wheel);
    },
    clean() {
      const target = self.target;
      target.removeEventListener("wheel", self.wheel);
    },
    ref(target) {
      if (target) self.mount(target);
    }
  });

  return self;
};

export const useWheelEvent = (_on: (self) => void) => {
  const [self] = useState(wheelEvent);
  const on = useCall(_on);
  useEffect(() => {
    self({ on });
    return () => {
      self({ on });
    };
  });
  return self;
};
