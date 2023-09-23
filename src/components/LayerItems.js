import * as React from "react";
import { useState } from "react";
import { useMutable, useOnce } from "../hooks";
import { Flex } from "./Flex";
import { Tree } from "./Tree";
import { LayerItem } from "./LayerItem";
import { moveObject } from "../core";

export const Layer = (props) => {
  const { onClick, objectTree } = props;

  // useOnce(() => sortObject(objectTree));

  const [selected, setSelected] = useState(objectTree);
  const [hovered, setHovered] = useState(null);
  const cache = useOnce(() => ({ id2Item: new Map() }));

  const handlers = useMutable({
    mount: (obj, id) => cache.id2Item.set(id, obj),
    clean: (_, id) => cache.id2Item.delete(id),
    click(obj) {
      if (obj.active) return;
      obj.active = true;
      setHovered(void 0);
      setSelected((p) => {
        if (p && p !== obj) p.active = false;
        return obj;
      });
    },
    draging(obj, drag) {
      const { value } = drag;
      // activate the grabbed obj
      if (cache.grabbed !== obj) handlers.click(obj);
      cache.grabbed = obj;

      const el = document.elementFromPoint(...value);
      const id = el?.getAttribute("data-id");
      let hovered = cache.id2Item.get(id);

      // if the hovered component is not a viewlayer
      if (!hovered) return setHovered((cache.hovered = null));
      // if (hovered.type.length !== 1) hovered = getParent(objectTree, hovered);
      // if (hovered.type.length !== 1) return setHovered((cache.hovered = null));

      return setHovered(() => (cache.hovered = hovered));
    },
    dragend() {
      const grabbed = cache.grabbed;
      const hovered = cache.hovered;
      cache.grabbed = null;
      cache.hovered = null;
      setHovered(null);
      if (!grabbed || !hovered || grabbed === hovered) return;
      moveObject(objectTree, grabbed, hovered);
    },
    clickIcon(obj) {
      if (obj.active) onClick();
    }
  });

  const render = (obj, grand, index = 0) => (
    <LayerItem
      key={obj.id}
      obj={obj}
      index={index}
      active={selected === obj}
      disable={hovered === obj}
      handlers={handlers}
    >
      {grand}
    </LayerItem>
  );

  return (
    <Flex>
      <Flex
        // backgroundImage="linear-gradient(0deg, #ffff00 50%, #0000ff 50%)"
        backgroundImage="linear-gradient(0deg, #282828 50%, #2B2B2B 50%)"
        backgroundSize="40px 40px"
        alignItems="start"
        justifyContent="start"
        color="#fff"
        minHeight="100vh"
      >
        <Tree tree={objectTree}>{render}</Tree>
      </Flex>
    </Flex>
  );
};
