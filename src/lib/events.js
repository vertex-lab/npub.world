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

/**
 * Returns a function that copies the given text to the clipboard when called.
 * Allows optional success and failure callbacks.
 *
 * @param {string} text - The text to copy.
 * @param {function} [onSuccess] - Called if the copy succeeds.
 * @param {function} [onFailure] - Called if the copy fails; receives the error.
 * @returns {function} - A function that performs the copy when invoked.
 */
export function copyToClipboard(text, onSuccess, onFailure) {
  return function() {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (onSuccess) onSuccess();
      })
      .catch((err) => {
        if (onFailure) onFailure(err);
        else console.error('copyToClickboard failed: ', err);
      });
  }
}