import * as React from "react";

export const Tree = (props) => {
  const { children: f, index = 0, tree } = props;

  if (!tree.children) return f(tree, null, index);

  if (!Array.isArray(tree.children))
    return f(tree, f(tree.children, null, index + 1), index);

  if (!tree.children.length) return f(tree, null, index);

  return f(
    tree,
    tree.children.map((child, key) => {
      return <Tree key={key} tree={child} index={index + 1} children={f} />;
    }),
    index
  );
};
