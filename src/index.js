import * as React from "react";
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

const App = () => {
  const objectTree = useOnce(() => createTree());
  const forceUpdate = useForceUpdate();

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
    convert(objectTree, ydoc);
    observe(objectTree, forceUpdate);
    console.log("\n\n")
    return new WebrtcProvider("roomId", ydoc);
  });

  // useOnce(() => {
  //   const ymap = ydoc.getMap("TEST");
  //   const yarr = new Y.Array();
  //   const child = new Y.Map()
  //   ymap.set("child", yarr);
  //   yarr.push([child]);

  //   ymap.observeDeep((e) => {
  //     console.log("CHANGED");
  //   });

  //   setInterval(() => {
  //     child.set("random", Math.random());
  //   }, 1000);

  //   return true;
  // });

  useOnce(() => Object.assign(document.body.style, style));

  return (
    <Flex>
      <Header onClick={handleClickAdd} onDelete={handleClickDelete} />
      <Layer
        onClick={handleClickAdd}
        objectTree={objectTree}
        forceUpdate={forceUpdate}
      />
    </Flex>
  );
};

createRoot(document.getElementById("root")).render(<App />);
