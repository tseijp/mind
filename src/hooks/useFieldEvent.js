import { event } from "reev";
import { useState } from "react";

export const fieldEvent = (on = () => {}) => {
  const self = event({
    on,
    down(e) {
      if (e.code === "Enter") self.on();
    },
    change(e) {
      self.value = e.target.value;
    },
    mount() {
      self.target.addEventListener("keydown", self.down);
      self.target.addEventListener("change", self.change);
      self.target.addEventListener("blur", self.on);
    },
    clean() {
      self.target.removeEventListener("keydown", self.down);
      self.target.removeEventListener("change", self.change);
      self.target.removeEventListener("blur", self.on);
    },
    ref(el) {
      if (el) {
        self.target = el;
        self.mount();
      } else self.clean();
    }
  });
  return self;
};

export const useFieldEvent = (on = () => {}) => {
  const [field] = useState(() => fieldEvent(on));
  return field;
};
