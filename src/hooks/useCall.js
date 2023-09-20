import { useRef } from "react";

export const useCall = (callback) => {
  const ref = useRef((...args) => ref.callback(...args)).current;

  ref.callback = callback;

  return ref;
};
