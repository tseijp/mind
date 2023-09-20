import * as React from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { createRoot } from "react-dom/client";
import {
  createTree,
  addCollection,
  deleteCollection,
  convert,
  observe
} from "./core";
import { useCall, useForceUpdate, useOnce } from "./hooks";
import { Layer, Flex, Header } from "../components";

const style = {
  margin: 0,
  padding: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "#282828"
};

const App = () => {
  const objectTree = useOnce(() => createTree());
  const forceUpdate = useForceUpdate();

  const handleClickAdd = useCall(() => {
    addCollection(objectTree);
    forceUpdate();
  });

  const handleClickDelete = useCall(() => {
    deleteCollection(objectTree);
    forceUpdate();
  });

  const ydoc = useOnce(() => new Y.Doc());

  useOnce(() => {
    convert(objectTree, ydoc);
    observe(objectTree);
    return new WebrtcProvider("roomId", ydoc);
  });

  useOnce(() => {
    const ymap = ydoc.getMap("TEST");
    const child = new Y.Map();
    ymap.set("child", child);

    child.observe((e) => {
      if (!e.transaction.local) console.log("CHANGED");
    });

    ymap.observe((e) => {
      if (!e.transaction.local) console.log("CHANGED");
    });

    setInterval(() => {
      child.set("random", Math.random());
    }, 1000);

    return true;
  });

  useOnce(() => Object.assign(document.body.style, style));

  return (
    <Flex>
      <Header onClick={handleClickAdd} onDelete={handleClickDelete} />
      <Layer onClick={handleClickAdd} objectTree={objectTree} />
    </Flex>
  );
};

createRoot(document.getElementById("root")).render(<App />);
