import { event } from "reev";
import * as Y from "yjs";

export const addSuffix = (ids, id) => {
  let suffix = "";
  let index = 1;
  const match = id.match(/^(.*)\.(\d{3})$/);
  if (match) id = match[1];
  const some = (name) => ids.some((_id) => _id === name);
  while (some(id + suffix)) {
    suffix = "." + String(index).padStart(3, "0");
    index++;
  }
  return id + suffix;
};

export const createObject = (type = "", props = {}, _children = []) => {
  const { id = type, children = _children, memo = {}, ...other } = props;

  return event({
    type,
    id,
    memo,
    children: Array.isArray(children) ? children : [children],
    ...other
  });
};

export const createTree = () => {
  // Camera
  const _Camera = createObject("+", { id: "Camera" });
  const Camera = createObject("+", { id: "Camera" }, _Camera);

  // Cube
  const Material = createObject("+", { id: "Material" });
  const _Cube = createObject("+", { id: "Cube" }, Material);
  const Cube = createObject("+", { id: "Cube" }, _Cube);

  // Light
  const _Light = createObject("+", { id: "Light" });
  const Light = createObject("+", { id: "Light" }, _Light);
  const Collection = createObject("+", { id: "Collection" }, [
    Camera,
    Cube,
    Light
  ]);
  const SceneCollection = createObject("+", {
    id: "Scene Collection",
    children: Collection
  });
  return SceneCollection;
};

export const getParent = (tree, item) => {
  if (tree.children.includes(item)) return tree;
  for (const child of tree.children) {
    if (Array.isArray(child.children)) {
      if (child.children.includes(item)) return child;
      const parent = getParent(child, item);
      if (parent) return parent;
    }
  }
};

export const moveObject = (tree, grabbed, hovered) => {
  if (isOffspring(grabbed, hovered)) return alert("moveObject Error");
  const parent = getParent(tree, grabbed);
  const index = parent.children.indexOf(grabbed);
  // sortObject(tree);
  hovered.children.push(grabbed); // add
  parent.children.splice(index, 1); // delete

  // ymap
  const _hovered = hovered.memo.yarr;
  const _grabbed = grabbed.memo.ymap;
  const _parent = parent.memo.yarr;

  if (!_hovered || !_grabbed || !_parent) return;
  _hovered.push([_grabbed]); // add
  _parent.delete(index, 1); // delete

  return tree;
};

export const addCollection = (tree) => {
  if (!tree.active) {
    for (const child of tree.children) addCollection(child);
    return;
  }

  const child = createObject("+", { id: "Collection" });
  const ids = tree.children.map(({ id }) => id);
  child.id = addSuffix(ids, child.id);
  tree.children.push(child); // add

  // ymap
  const yarr = tree.memo.yarr;
  const ymap = convert(child);
  if (!yarr || !ymap) return;
  yarr.push([ymap]); // yarr.set(child.id, ymap);
};

export const deleteCollection = (tree, parent) => {
  if (!tree.active) {
    for (const child of tree.children) deleteCollection(child, tree);
    return;
  }
  if (!parent || !parent.children) return;
  const index = parent.children.indexOf(tree);
  parent.children.splice(index, 1);

  // ymap
  const yarr = parent.memo.yarr;
  const ymap = tree.memo.ymap;
  if (!yarr || !ymap) return;
  yarr.delete(index); // yarr.delete(tree.id);
};

export const isOffspring = (target, self) => {
  if (!target.children || target.children.length === 0) return false;
  if (target.children.includes(self)) return true;
  for (const child of target.children)
    if (isOffspring(child, self)) return true;
  return false;
};

/**
 * ymaps
 */
const YMAP_KEY = "PLObject_TOP_TREE";

const ymap2Obj = new WeakMap();
const yarr2Obj = new WeakMap();

export const convert = (obj, ydoc = null) => {
  const ymap = ydoc ? ydoc.getMap(YMAP_KEY) : new Y.Map();
  for (const key in obj) {
    if (key === "children") {
      const children = obj[key];
      const yarr = new Y.Array();
      children.forEach((child) => {
        yarr.push([convert(child)]);
      });
      obj.memo.yarr = yarr;
      ymap.set(key, yarr);
    } else if (key !== "memo") {
      ymap.set(key, obj[key]);
    }
  }
  obj.memo.ymap = ymap;
  obj.memo.ydoc = ydoc;
  ymap2Obj.set(obj.memo.ymap, obj);
  yarr2Obj.set(obj.memo.yarr, obj);
  return ymap;
};

export const observe = (obj) => {
  // console.log("OBSERVED: " + obj.id);
  const { ymap, yarr } = obj.memo;

  // nested observe
  if (Array.isArray(obj.children))
    obj.children.forEach((child) => observe(child));

  if (!ymap) return alert("oberse error: ymap is not defined");
  ymap.observe((e) => {
    console.log(e);
    if (e.transaction.local) return;
    e.changes.keys.forEach((change, key) => {
      if (key === "children") return;
      if (key === "memo") return;
      obj[key] = ymap.get(key);
      if (obj.forceUpdate) obj.forceUpdate();
    });
  });

  if (!yarr) return alert("oberse error: yarr is not defined");
  yarr.observe((e) => {
    console.log(e);
    if (e.transaction.local) return;
    e.changes.keys.forEach((change, key) => {
      console.log("key");
    });
    if (obj.forceUpdate) obj.forceUpdate();
  });
};

// export const sortObject = (tree) => {
//   const { children } = tree;
//   if (!children) return;
//   children.sort((a, b) => (a.id < b.id ? -1 : 1));
//   children.forEach(sortObject);
//   return tree;
// };
