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
import { useCall, useForceUpdate, useOnce } from "./hooks";
import { Layer, Flex, Header } from "./components";

const style = {
  margin: 0,
  padding: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "#282828"
};

const CONNECTED_TIMEOUT_MS = 100;

const App = () => {
  const objectTree = useOnce(() => createTree());
  const forceUpdate = useForceUpdate();
  const [isReady, setIsReady] = useState(false);

  const handleClickAdd = useCall(() => {
    addObject(objectTree, forceUpdate);
    forceUpdate();
  });

  const handleClickDelete = useCall(() => {
    deleteObject(objectTree);
    forceUpdate();
  });

  const ydoc = useOnce(() => new Y.Doc());

  useOnce(() => {
    const provider = new WebrtcProvider("roomId", ydoc);
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
      <Header onClick={handleClickAdd} onDelete={handleClickDelete} />
      <Layer onClick={handleClickAdd} objectTree={objectTree} />
    </Flex>
  );
};

createRoot(document.getElementById("root")).render(<App />);
