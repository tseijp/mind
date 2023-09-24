import * as React from "react";
import { useState } from "react";
import { Flex } from "./Flex";
import { LayerItemIcon } from "./LayerItemIcon";
import { LayerItemField } from "./LayerItemField";
import { useCall, useOnce } from "../hooks";


const { floor, random } = Math;

export const Header = (props) => {
  const { children, roomId, onClick, onDelete, onChange } = props;
  const [name, set] = useState(INIT_USER_NAME);

  const handleOpen = useCall((value) => {
    window.open(`?roomId=${value}&userId=${name}`, "_blank");
  });

  const handleChange = useCall((value) => {
    set((prev) => {
      if (prev !== value) onChange(value);
      return value;
    });
  });

  useOnce(() => {
    onChange(name);
    return true;
  });

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
      <div style={{ display: "flex" }}>
        Username:
        <LayerItemField onChange={handleChange}>{name}</LayerItemField>
      </div>
      <div style={{ display: "flex" }}>
        Room ID:
        <LayerItemField onChange={handleOpen}>{roomId}</LayerItemField>
      </div>
      {children}
    </Flex>
  );
};

const USER_NAMES = [
  "Akechi",
  "Baba",
  "Chosokabe",
  "Date",
  "Edward",
  "Fuuma",
  "Gamo",
  "Honda",
  "Imagawa",
  "Jinbo",
  "Katakura",
  "Li",
  "Maeda",
  "Naoe",
  "Oda",
  "Pierre",
  "Qiu",
  "Rokkaku",
  "Shibata",
  "Takeda",
  "Uesugi",
  "Vettor",
  "William",
  "Xu",
  "Yoshida",
  "Zhang",
];

const INIT_USER_NAME = USER_NAMES[floor(random() * USER_NAMES.length)];
