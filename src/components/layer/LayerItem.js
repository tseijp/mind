import * as React from "react";
import { Flex } from "../Flex";
import { useId, useRef, useState, useEffect } from "react";
import { LayerItemCollapse } from "./LayerItemCollapse";
import { LayerItemField } from "./LayerItemField";
import { LayerItemIcon } from "./LayerItemIcon";
import { Draggable } from "../Draggable";
import { useCall, useForceUpdate } from "../../hooks";
// import { addSuffix, getParent } from "../../core";

export const LayerItem = (props) => {
  const { children, obj, index = 0, active, disable, handlers } = props;
  const id = useId();
  const ref = useRef(null);
  const withChildren = !!children;
  const [isOpen, setIsOpen] = useState(withChildren);

  useEffect(() => setIsOpen(withChildren), [withChildren]);

  const handleClickCollapse = useCall(() => setIsOpen((p) => !p));

  const handleDraging = useCall((drag) => {
    handlers.draging(obj, drag);
  });

  const handleDragEnd = useCall((drag) => {
    handlers.dragend(obj, drag);
  });

  const handleChange = useCall((value) => {
    if (!value) value = "Object";
    obj.id = value;
    // @ts-ignore
    obj.forceUpdate();
    // yjs
    obj.memo.ymap.set("id", value);
  });

  const handleClickIcon = useCall(() => {
    handlers.clickIcon(obj);
  });

  const forceUpdate = useForceUpdate();

  const effect = useCall(() => {
    if (!ref.current) return;
    const click = () => handlers.click(obj);
    // since can not do hover event when dragging
    ref.current.setAttribute("data-id", id);
    ref.current.addEventListener("click", click);
    handlers.mount(obj, id);
    // @ts-ignore
    obj({ forceUpdate });
    return () => handlers.clean(obj, id);
  });

  useEffect(() => effect(), [effect]);

  const left = 8 + (index === 0 ? 0 : (index - 1) * 22);
  const background = active ? "#2B4E84" : disable ? "#000" : "";

  return (
    <div
      style={{
        width: "100%",
        display: "relative",
        overflowX: "visible",
        overflowY: "visible"
      }}
    >
      <Flex
        ref={ref}
        row
        justifyContent="start"
        alignItems="start"
        height="20px"
        background={background}
        paddingLeft={left + "px"}
        overflowX="visible"
        overflowY="visible"
      >
        <LayerItemCollapse
          index={index}
          isOpen={isOpen}
          onClick={handleClickCollapse}
        />
        {/* {!obj.memo.ymap && "NO YMAP"}
        {!obj.memo.yarr && "NO YARR"}
        {!obj.memo.ymap.doc && "NO YDOC"}
        {!obj.memo.yarr.length && obj.memo.yarr.length} */}
        <div onClick={handleClickIcon}>
          <LayerItemIcon active={active}>
            <div data-id={id}>{obj.type?.[0]}</div>
          </LayerItemIcon>
        </div>
        <LayerItemField value={obj.id} onChange={handleChange}>
          <Draggable onDraging={handleDraging} onDragEnd={handleDragEnd}>
            <div data-id={id}>{obj.id}</div>
          </Draggable>
        </LayerItemField>
      </Flex>
      <div
        style={{
          height: isOpen ? "auto" : "0px",
          overflow: isOpen ? "visible" : "hidden"
        }}
      >
        {children}
      </div>
    </div>
  );
};
