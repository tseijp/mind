import { useEffect, useState } from "react";
import { useOnce } from "./useOnce";
import { useCall } from "./useCall";

const TICK_TIMEOUT_MS = 100;

export const useUsers = (ydoc, userId, roomId) => {
  const [users, setUsers] = useState([]);

  const observeUsers = useCall((e) => {
    if (e.transaction.local) return;
    const _users = []
    e.changes.keys.forEach((_, key) => _users.push(key)); // map is not supported
    setUsers((users) => {
      _users.forEach((key) => {
        const target = ymap.get(key);
        const isExist = users.includes(key);
        if (target === roomId) users = isExist ? users : [...users, key];
        else users = isExist ? users.filter((user) => user !== key) : users;
      });
      return users;
    });
  });

  const ymap = useOnce(() => {
    const ymap = ydoc.getMap("users");
    ymap.set(userId, roomId);
    ymap.observe(observeUsers);
    return ymap;
  });

  const user = useOnce(() => {
    const user = ydoc.getMap(userId);
    return user;
  });

  useEffect(() => {
    let x = 0, y = 0;
    const mousemove = (e) => {
      x = e.clientX << 0;
      y = e.clientY << 0;
      user.set("x", x);
      user.set("y", y);
    };
    window.addEventListener("mousemove", mousemove);

    return () => {
      setUsers([]);
      ymap.unobserve(observeUsers);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

  return { user, users };
};
