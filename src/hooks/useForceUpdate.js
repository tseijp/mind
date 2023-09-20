import { useState } from "react";
import { useCall } from "./useCall";
export const useForceUpdate = () => {
  const [, set] = useState(-1);
  return useCall(() => set(Math.random()));
};
