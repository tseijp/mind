import * as React from "react";
import { useState } from "react";
import { Field } from "./Field";
import { useFieldEvent, useCall } from "../hooks";

export const LayerItemField = (props) => {
  const { value, children, onChange = () => {} } = props;

  const onFieldEventFinish = useCall(() => {
    setIsActive(false);
    if (field.value === value) return;
    onChange(field.value);
  });

  const handleDoubleClick = () => {
    setIsActive(true);
    field.value = value;
    field.target.select();
    setTimeout(() => field.target.focus(), 1);
  };

  const [isActive, setIsActive] = useState(false);
  const field = useFieldEvent(onFieldEventFinish);

  return (
    <div
      style={{
        marginLeft: "3px",
        fontSize: "12px",
        lineHeight: "20px"
      }}
    >
      <div
        style={{ display: isActive ? "none" : "" }}
        onDoubleClick={handleDoubleClick}
      >
        {children}
      </div>
      <Field
        // @ts-ignore
        ref={field.ref}
        height="20px"
        color="white"
        display={isActive ? "" : "none"}
        value={value}
      />
    </div>
  );
};
