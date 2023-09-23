import React, { useState } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useOnce } from "../hooks";
const style = {
  position: "absolute",
  width: 10,
  height: 10,
  borderRadius: 9999,
  color: "white",
  backgroundColor: "white",
};

export const Cursor = (props) => {
  const { ydoc, userId } = props;
  const [opacity, setOpacity] = useState(1);
  const [username, setUsername] = useState("anonymous");

  const ref = useRef();

  useOnce(() => {
    const user = ydoc.getMap(userId);
    let listener = () => {};
    let timeoutId = 0;
    user.observe((e) => {
      if (e.transaction.local) return;
      const el = ref.current;
      if (!el) return;
      setOpacity(1);
      listener();
      listener = () => clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setOpacity(0.1), 1000);
      e.changes.keys.forEach((_, key) => {
        if (key === "x") gsap.to(el, { left: user.get(key) });
        if (key === "y") gsap.to(el, { top: user.get(key) });
        if (key === "username") setUsername(user.get(key));
      });
    });
  });

  return (
    <div ref={ref} style={{ ...style, opacity }}>
      {username}
    </div>
  );
};

export const Users = (props) => {
  const { ydoc, users } = props;
  console.log(users);
  return users.map((key) => <Cursor key={key} userId={key} ydoc={ydoc} />);
};
