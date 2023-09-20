import { mutable } from "reev";
import { useOnce } from "./useOnce";

export const useMutable = (...args) => {
  const memo = useOnce(() => mutable());
  return memo(...args);
};
