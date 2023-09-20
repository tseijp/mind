export const addV = (a, b) => [a[0] + b[0], a[1] + b[1]];

export const subV = (a, b) => [a[0] - b[0], a[1] - b[1]];

const LINE_HEIGHT = 40;

const PAGE_HEIGHT = 800;

export const wheelValues = (event) => {
  let { deltaX, deltaY, deltaMode } = event;
  if (deltaMode === 1) {
    deltaX *= LINE_HEIGHT;
    deltaY *= LINE_HEIGHT;
  } else if (deltaMode === 2) {
    deltaX *= PAGE_HEIGHT;
    deltaY *= PAGE_HEIGHT;
  }
  return [deltaX, deltaY];
};
