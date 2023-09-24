import { useEffect, useState } from "react";
import { useOnce } from "./useOnce";
import { useCall } from "./useCall";

const TICK_TIMEOUT_MS = 1000;

const createChecker = (key, onOffline) => {
  const tick = () => {
    delete listeners[key];
    onOffline(key);
  };

  let timeoutId = setTimeout(tick, TICK_TIMEOUT_MS * 5);
  let listeners = () => clearTimeout(timeoutId);

  return () => {
    listeners();
    timeoutId = setTimeout(tick, TICK_TIMEOUT_MS * 5);
    listeners = () => clearTimeout(timeoutId);
  }
};

export const useUsers = (ydoc, userId, roomId) => {
  const [users, setUsers] = useState([]);
  const checkers = useOnce(() => ({}));

  const handleOffline = useCall((key) => {
    ymap.delete(key);
    setUsers((users) => users.filter((user) => user !== key));
  });

  const observeUsers = useCall((e) => {
    if (e.transaction.local) return;
    const _users = [];
    e.changes.keys.forEach((_, key) => _users.push(key)); // map is not supported
    setUsers((users) => {
      _users.forEach((key) => {
        if (key === userId) return;
        if (!checkers[key]) checkers[key] = createChecker(key, handleOffline);
        checkers[key]();
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
    let x = 0,
      y = 0;
    const mousemove = (e) => {
      x = e.clientX << 0;
      y = e.clientY << 0;
      user.set("x", x);
      user.set("y", y);
    };

    const tick = () => {
      ymap.set(userId, roomId);
      timeoutId = setTimeout(tick, TICK_TIMEOUT_MS);
    }

    let timeoutId = setTimeout(tick, TICK_TIMEOUT_MS);
    window.addEventListener("mousemove", mousemove);

    return () => {
      setUsers([]);
      clearTimeout(timeoutId);
      ymap.unobserve(observeUsers);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

  return { user, users, ymap };
};
