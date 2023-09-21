import * as React from "react";
import { Flex } from "./Flex";

export const LayerItemIcon = (props) => {
  const { active, children } = props;
  return (
    <Flex
      width="20px"
      height="20px"
      cursor="pointer"
      marginLeft="2px"
      borderRadius="4px"
      border={active ? "1px solid #696969" : ""}
      background={active ? "#535353" : ""}
      display="flex"
    >
      {children}
    </Flex>
  );
};
