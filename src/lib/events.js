export function onEsc(func) {
  return function (event) {
    if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) func();
  };
}

export function onEnter(func) {
  return function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) func();
  };
}

export function onOutsideClick(node, func) {
  return function (event) {
    if (!node.contains(event.target)) func();
  };
}