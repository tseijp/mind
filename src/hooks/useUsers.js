import { useEffect, useState } from "react";
import { event } from "reev";
import { useOnce } from "./useOnce";

export const createUsersEvent = () => {
  return event();
};

export const useUsers = (ydoc, userId, roomId) => {
  const [users, setUsers] = useState([]);

  const ymap = useOnce(() => {
    const ymap = ydoc.getMap("users");
    ymap.set(userId, roomId);
    ymap.observe((e) => {
      if (e.transaction.local) return;
      e.changes.keys.forEach((_, key) => {
        setUsers((users) => {
          const isExist = users.includes(key);
          const target = ymap.get(key);
          if (target === roomId) return isExist ? users : [...users, key];
          return isExist ? users.filter((user) => user !== key) : users;
        });
      });
    });

    return ymap;
  });

  const user = useOnce(() => {
    const user = ydoc.getMap(userId);
    return user;
  });

  useEffect(() => {
    let timeoutId = 0, x = 0, y = 0, _x, _y;
    const mousemove = (e) => {
      x = e.clientX;
      y = e.clientY;
    };
    const tick = () => {
      if (x !== _x) {
              _x = x / window.innerWidth;
              user.set("x", x);
      }
      if (y !== _y) {
              _y = y / window.innerHeight;
              user.set("y", y);
      }
      timeoutId = setTimeout(tick, 100);
    };
    timeoutId = setTimeout(tick, 100);
    window.addEventListener("mousemove", mousemove);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

  return { user, users };
};
