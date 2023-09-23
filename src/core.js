import { event } from "reev";

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
  const {
    id = type,
    key = type,
    children: c = _children,
    memo = {},
    ...other
  } = props;

  const children = Array.isArray(c) ? c : [c];

  const ret = event({
    type,
    id,
    key,
    memo,
    children,
    ...other,
  });

  children.forEach((child) => {
    child.parent = ret;
  });

  return ret;
};

export const createTree = () => {
  const a0 = createObject("+", { id: "a@tsei.jp" });
  const a1 = createObject("+", { id: "c618934f-2e83-4eb1-b902-81d2002ac5f7" });
  const b0 = createObject("+", { id: "b@tsei.jp" });
  const b1 = createObject("+", { id: "f7570262-ab22-44f8-9eec-2372a7545adf" });
  const c0 = createObject("+", { id: "c@tsei.jp" });
  const c1 = createObject("+", { id: "9cdf2305-c68a-4876-9afa-e9941879070b" });
  const r00 = createObject("+", { id: "UserA paired with UserB" });
  const r0 = createObject("+", { id: "Matching feature success" }, [r00]);
  const r1 = createObject("+", {  id: "Auto send first message to both userA and userB is success" });
  const r2 = createObject("+", { id: "Query data in Appsync is success" });
  const a = createObject("+", { id: "UserA" }, [a0, a1]);
  const b = createObject("+", { id: "UserB" }, [b0, b1]);
  const c = createObject("+", { id: "UserC" }, [c0, c1]);
  const r = createObject("+", { id: "Result" }, [r0, r1, r2]);
  const root = createObject("+", { id: "I tested in Release ENV" }, [a, b, c, r]);
  const mtg1 = createObject("+", { id: "Meeting 1" }, [root]);
  const mtg2 = createObject("+", { id: "Meeting 2" });
  const mtg3 = createObject("+", { id: "Meeting 3" });
  const tree = createObject("+", { id: "Meeting GitMind" }, [mtg1, mtg2, mtg3]);
  return tree;
};

// @TODO DELETE
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

export const activateObject = (obj) => {
  const yarr = obj.parent.memo.yarr;
  yarr.set(obj.key, true);
  obj.children.forEach(activateObject);
}

export const deactivateObject = (obj) => {
  const yarr = obj.parent.memo.yarr;
  yarr.set(obj.key, false);
  obj.children.forEach(deactivateObject);
};

export const addObject = (tree) => {
  if (!tree.active) {
    for (const child of tree.children) addObject(child);
    return;
  }

  const child = createObject("+", { id: "Collection" });
  const ids = tree.children.map(({ id }) => id);
  child.parent = tree;
  child.id = addSuffix(ids, child.id);
  tree.children.push(child); // add

  // ymap
  const yarr = tree.memo.yarr;
  child.key = getLayerKey(child);
  yarr.set(child.key, true);
  convert(child);
  observe(child);
  obj2ymap(child);
  return tree;
};

export const deleteObject = (tree, parent) => {
  if (!tree.active) {
    for (const child of tree.children) deleteObject(child, tree);
    return;
  }
  if (!parent || !parent.children) return;
  const index = parent.children.indexOf(tree);
  parent.children.splice(index, 1);

  // ymap
  const yarr = parent.memo.yarr;
  const ymap = tree.memo.ymap;
  if (!yarr || !ymap) return;
  deactivateObject(tree);
  return tree;
};

export const moveObject = (tree, grabbed, hovered) => {
  // if (grabbed.children?.length) return alert("Error"); // @TODO FIX
  if (isOffspring(grabbed, hovered)) return alert("Error");
  const parent = getParent(tree, grabbed);
  const index = parent.children.indexOf(grabbed);
  const prevKey = grabbed.key;

  // sortObject(tree);
  hovered.children.push(grabbed); // add
  grabbed.parent = hovered;
  grabbed.key = "+";
  grabbed.key = getLayerKey(grabbed);
  parent.children.splice(index, 1); // delete

  // ymap
  const _hovered = hovered.memo.yarr;
  const _parent = parent.memo.yarr;
  if (!_hovered || !_parent) return;

  deactivateObject(grabbed);
  _parent.set(prevKey, false);
  _hovered.set(grabbed.key, true);

  unobserve(grabbed);
  convert(grabbed);
  activateObject(grabbed);
  observe(grabbed);
  obj2ymap(grabbed);

  return tree;
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
export const isIgnoreKey = (key) => {
  if (key === "children") return true;
  if (key === "parent") return true;
  if (key === "memo") return true;
  return false;
};

export const obj2ymap = (obj) => {
  const ymap = obj.memo.ymap;
  for (const key in obj) {
    if (typeof obj[key] === "function") continue;
    if (isIgnoreKey(key)) continue;
    ymap.set(key, obj[key]);
  }
  if (obj.children?.length >= 1) obj.children.forEach(obj2ymap);
};

export const getLayerKey = (obj) => {
  if (!obj.parent) return obj.key;
  const key = obj.parent.key + "$" + obj.key;

  if (!obj.parent.children || obj.parent.children.length <= 1) return key;
  const keys = obj.parent.children.map(({ key }) => key);
  return (obj.key = addSuffix(keys, key));
};

export const ymap2obj = (obj) => {
  const ymap = obj.memo.ymap;
  for (const key in obj) {
    if (isIgnoreKey(key)) continue;
    const value = ymap.get(key);
    if (value !== void 0) obj[key] = value;
  }
};

export const yarr2obj = (obj) => {
  const yarr = obj.memo.yarr;
  yarr.forEach((active, key) => {
    if (active) {
      const child = insertObject(obj, key);
      if (!child) return;
      child.parent = obj;
      convert(child);
      observe(child);
    } else {
      spliceObject(obj, key);
      unobserve(obj);
    }
  });
};

export const convert = (obj, ydoc) => {
  // Pass top ydoc recursively
  if (!ydoc) ydoc = obj?.parent?.memo?.ydoc;
  if (!ydoc) return;
  obj.memo.ydoc = ydoc;

  const ymap = ydoc.getMap(obj.key);
  if (obj.children) {
    const yarr = ydoc.getMap("$" + obj.key);
    obj.children.forEach((child) => {
      child.key = "+"; // @TODO FIX
      child.key = getLayerKey(child);
      // yarr.set(child.key, true); // !!!!!!!!!!!!!!!!!!!!!!
      convert(child, ydoc);
    });
    obj.memo.yarr = yarr;
    yarr2obj(obj);
  }
  obj.memo.ymap = ymap;
  ymap2obj(obj);
  return ymap;
};

export const observe = (obj, forceUpdateRoot) => {
  const { ymap, yarr } = obj.memo;

  const ymapObserve = (e) => {
    if (e.transaction.local) return;
    e.changes.keys.forEach((_, key) => {
      if (isIgnoreKey(key)) return;
      obj[key] = ymap.get(key);
      if (obj.forceUpdate) obj.forceUpdate();
    });
  };

  const yarrObserve = (e) => {
    if (e.transaction.local) return;
    e.changes.keys.forEach((_, key) => {
      const active = yarr.get(key);
      if (active) {
        const child = insertObject(obj, key);
        convert(child);
        observe(child);
        ymap2obj(child);
      } else spliceObject(obj, key);
      if (obj.memo.forceUpdateRoot) obj.memo.forceUpdateRoot();
    });
  };

  if (yarr) yarr.observe(yarrObserve);
  if (ymap) ymap.observe(ymapObserve);
  if (!obj.memo.unobserveListener) obj.memo.unobserveListener = new Set();
  obj.memo.unobserveListener.add(() => ymap.unobserve(ymapObserve));
  obj.memo.unobserveListener.add(() => yarr.unobserve(yarrObserve));
  obj.memo.forceUpdateRoot = forceUpdateRoot || obj.parent.memo.forceUpdateRoot;

  // nested observe
  if (Array.isArray(obj.children))
    obj.children.forEach((child) => observe(child));
};

const insertObject = (obj, key = "") => {
  if (obj.children.some((child) => child.key === key)) return;
  const child = createObject("+", { id: "Collection" });
  child.parent = obj;
  if (key) child.key = key;
  obj.children.push(child);
  return child;
};

const spliceObject = (obj, key) => {
  const index = obj.children.findIndex((child) => child.key === key);
  const child = obj.children[index];
  if (!child || !child.key) return console.warn(`Warn: ${key} not found`);
  obj.children.splice(index, 1);
  unobserve(child);
};

export const unobserve = (obj) => {
  if (Array.isArray(obj.children)) obj.children.forEach(unobserve);
  if (obj.memo.unobserveListener) {
    obj.memo.unobserveListener.forEach((f) => f());
    obj.memo.unobserveListener.clear();
  }
};

// export const sortObject = (tree) => {
//   const { children } = tree;
//   if (!children) return;
//   children.sort((a, b) => (a.id < b.id ? -1 : 1));
//   children.forEach(sortObject);
//   return tree;
// };
