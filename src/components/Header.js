import * as React from "react";
import { Flex } from "./Flex";
import { LayerItemIcon } from "./layer/LayerItemIcon";
import { LayerItemField } from "./layer/LayerItemField";

export const Header = (props) => {
  const { children, onClick, onDelete } = props;

  return (
    <Flex
      row
      gap="1rem"
      paddingTop="5px"
      height="25px"
      overflow="visible"
      justifyContent="start"
      paddingLeft="8px"
      color="#fff"
      backgroundColor="#282828"
    >
      <div onClick={onClick} style={{ display: "flex" }}>
        <LayerItemIcon active children="+" />
        <LayerItemField>ADD</LayerItemField>
      </div>
      <div onClick={onDelete} style={{ display: "flex" }}>
        <LayerItemIcon active children="-" />
        <LayerItemField>DELETE</LayerItemField>
      </div>
      {children}
    </Flex>
  );
};
