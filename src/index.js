import * as React from "react";
import { useState } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { createRoot } from "react-dom/client";
import {
  createTree,
  addObject,
  deleteObject,
  convert,
  observe
} from "./core";
import { useCall, useForceUpdate, useOnce, useUsers } from "./hooks";
import { Layer, Flex, Header, Users } from "./components";

const style = {
  margin: 0,
  padding: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "#282828"
};

const CONNECTED_TIMEOUT_MS = 100;
const { floor, random } = Math;
const App = () => {
  const [isReady, setIsReady] = useState(false);
  const objectTree = useOnce(() => createTree());
  const forceUpdate = useForceUpdate();

  const params = useOnce(() => new URLSearchParams(window.location.search));

  const userId = useOnce(() => params.get("userId") || "" + floor(random() * 100000000000));
  const roomId = useOnce(() => params.get("roomId") || "" + floor(random() * 100));

  useOnce(() => {
    window.history.replaceState(null, "", `?roomId=${roomId}&userId=${userId}`);
    return true;
  })

  const ydoc = useOnce(() => new Y.Doc());
  const { user, users, ymap } = useUsers(ydoc, userId, roomId);

  const handleChange = useCall((value) => {
    user.set("username", value);
  });

  const handleAdd = useCall(() => {
    addObject(objectTree, forceUpdate);
    forceUpdate();
  });

  const handleDelete = useCall(() => {
    deleteObject(objectTree);
    forceUpdate();
  });


  useOnce(() => {
    const provider = new WebrtcProvider(roomId, ydoc);
    convert(objectTree, ydoc);
    observe(objectTree, forceUpdate);

    // Observed values are not always updated when reloading the browser.
    const tick = () => {
      if (!provider.connected) setTimeout(tick, CONNECTED_TIMEOUT_MS);
      else setIsReady(true);
    };
    setTimeout(tick, CONNECTED_TIMEOUT_MS);
    return provider;
  });

  useOnce(() => Object.assign(document.body.style, style));

  if (!isReady) return;

  return (
    <Flex backgroundColor="#282828">
      <Header
        roomId={roomId}
        onClick={handleAdd}
        onDelete={handleDelete}
        onChange={handleChange}
      />
      <Layer onClick={handleAdd} objectTree={objectTree} />
      <Users ydoc={ydoc} users={users} ymap={ymap} />
    </Flex>
  );
};

createRoot(document.getElementById("root")).render(<App />);
