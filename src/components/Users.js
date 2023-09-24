import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useCall, useOnce } from "../hooks";
const style = {
  position: "absolute",
  width: 10,
  height: 10,
  color: "white",
  borderRadius: 9999,
  backgroundColor: "white",
};

export const Cursor = (props) => {
  const { ydoc, userId } = props;
  const [opacity, setOpacity] = useState(1);
  const [username, setUsername] = useState("anonymous");
  const ref = useRef();
  const user = useOnce(() => ydoc.getMap(userId));
  const update = useCall((key) => {
    if (key === "username") setUsername(user.get(key));
    const el = ref.current;
    if (!el) return;
    if (key === "x") gsap.to(el, { left: user.get(key) });
    if (key === "y") gsap.to(el, { top: user.get(key) });
  });
  useOnce(() => {
    let listener = () => {};
    let timeoutId = 0;
    user.observe((e) => {
      if (e.transaction.local) return;
      setOpacity(1);
      listener();
      listener = () => clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setOpacity(0), 1000);
      e.changes.keys.forEach((_, key) => update(key));
    });
  });
  useEffect(() => {
    update("x");
    update("y");
    update("username");
  }, [])

  return (
    <div ref={ref} style={{ ...style, opacity }}>
      <div style={{ margin: 10 }}>{username}</div>
    </div>
  );
};

export const Users = (props) => {
  const { ydoc, users } = props;
  return users.map((key) => <Cursor key={key} userId={key} ydoc={ydoc} />);
};
