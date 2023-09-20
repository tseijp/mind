import { useRef } from "react";

export const useOnce = (callback) => {
  const ref = useRef(null);
  if (!ref.current) ref.current = callback();
  return ref.current;
};
