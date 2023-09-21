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
  const r1 = createObject("+", { id: "Auto send first message to both userA and userB is success" });
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
  return tree
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

export const moveObject = (tree, grabbed, hovered, forceUpdate) => {
  if (grabbed.children?.length) return alert("Error"); // @TODO FIX
  if (isOffspring(grabbed, hovered)) return alert("Error");
  const parent = getParent(tree, grabbed);
  const index = parent.children.indexOf(grabbed);
  // sortObject(tree);
  hovered.children.push(grabbed); // add
  grabbed.parent = hovered;
  grabbed.key = "+"
  grabbed.key = getLayerKey(grabbed);
  parent.children.splice(index, 1); // delete

  // ymap
  const _hovered = hovered.memo.yarr;
  const _parent = parent.memo.yarr;
  if (!_hovered || !_parent) return;

  unobserve(grabbed);
  convert(grabbed, parent.memo.ydoc);
  observe(grabbed, forceUpdate);

  _hovered.push([grabbed.key]); // add
  _parent.delete(index, 1); // delete
  return tree;
};

export const addObject = (tree, forceUpdate) => {
  if (!tree.active) {
    for (const child of tree.children) addObject(child, forceUpdate);
    return;
  }

  const child = createObject("+", { id: "Collection" });
  const ids = tree.children.map(({ id }) => id);
  child.parent = tree;
  child.id = addSuffix(ids, child.id);
  tree.children.push(child); // add

  // ymap
  const yarr = tree.memo.yarr;
  const ydoc = tree.memo.ydoc;
  if (!yarr || !ydoc) return;
  child.key = getLayerKey(child);
  convert(child, ydoc);
  observe(child, forceUpdate);
  yarr.push([child.key]);
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
  yarr.delete(index); // yarr.delete(tree.id);
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
export const getLayerKey = (obj) => {
  if (!obj.parent) return obj.key;
  const key = obj.parent.key + "$" + obj.key;

  if (!obj.parent.children || obj.parent.children.length <= 1) return key;
  const keys = obj.parent.children.map(({ key }) => key);
  return (obj.key = addSuffix(keys, key));
};

export const convert = (obj, ydoc, withoutSet) => {
  const ymap = ydoc.getMap(obj.key);
  if (obj.children) {
    const yarr = ydoc.getArray("$" + obj.key);
    obj.children.forEach((child) => {
      child.key = "+"; // @TODO FIX
      child.key = getLayerKey(child);
      convert(child, ydoc);
      yarr.push([child.key]);
    });
    obj.memo.yarr = yarr;
    // ymap.set("children", yarr) // ERROR
  }
  for (const key in obj) {
    if (withoutSet) continue;
    if (typeof obj[key] === "function") continue;
    if (key === "parent" || key === "memo" || key === "children") continue;
    console.log("SETEED", key, obj[key]);
    ymap.set(key, obj[key]);
  }
  obj.memo.ymap = ymap;
  obj.memo.ydoc = ydoc;
  return ymap;
};

export const observe = (obj, forceUpdate) => {
  const { ymap, yarr } = obj.memo;

  // nested observe
  if (Array.isArray(obj.children))
    obj.children.forEach((child) => observe(child, forceUpdate));

  if (!ymap) return alert("oberse error: ymap is not defined");
  const ymapObserve = (e) => {
    if (e.transaction.local) return;
    if (e) console.log("OBSERVERD", e);
    e.changes.keys.forEach((_, key) => {
      if (key === "children") return;
      if (key === "parent") return;
      if (key === "memo") return;
      obj[key] = ymap.get(key);
      if (obj.forceUpdate) obj.forceUpdate();
    });
  };
  ymap.observe(ymapObserve);
  if (!obj.memo.unobserveListener) obj.memo.unobserveListener = new Set();
  obj.memo.unobserveListener.add(() => ymap.unobserve(ymapObserve));

  if (!yarr) return alert("oberse error: yarr is not defined");
  const yarrObjserve = (e) => {
    if (e.transaction.local) return;
    e.changes.delta.forEach((delta) => {
      delta.insert?.forEach((key) => {
        createAll(obj, key, forceUpdate);
        forceUpdate(); // obj.forceUpdate(); @TODO FIX
      })
      if (delta.delete === 1) {
        deleteAll(obj, e);
        forceUpdate(); // obj.forceUpdate(); @TODO FIX
      }
    });
  };
  yarr.observe(yarrObjserve);
  obj.memo.unobserveListener.add(() => yarr.unobserve(yarrObjserve));
};

const createAll = (obj, key, forceUpdate) => {
  if (obj.children.some((child) => child.key === key)) return;
  const child = createObject("+", { id: "Collection" });
  child.parent = obj;
  child.key = key;
  obj.children.push(child);
  setTimeout(() => {

  convert(child, obj.memo.ydoc, true);
  observe(child, forceUpdate);
  }, 1000)
  // for (let i = 0; i < child.memo.yarr.length; i++) {
  //   createAll(child, )
  // }
};

const deleteAll = (obj, e) => {
  const index = e.changes.delta.map(({ retain }) => retain)[0] || 0;
  const child = obj.children[index];
  if (!child || !child.key) return console.warn(index);
  obj.children.splice(index, 1);
  unobserve(child);
}

export const unobserve = (obj) => {
  if (Array.isArray(obj.children)) obj.children.forEach(unobserve);
  if (obj.memo.unobserveListener) {
    obj.memo.unobserveListener.forEach(f => f());
    obj.memo.unobserveListener.clear();
  }
}

// export const sortObject = (tree) => {
//   const { children } = tree;
//   if (!children) return;
//   children.sort((a, b) => (a.id < b.id ? -1 : 1));
//   children.forEach(sortObject);
//   return tree;
// };
