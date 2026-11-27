let handler = null;

export function setSessionExpiredHandler(fn) {
  handler = fn;
}

export function notifySessionExpired() {
  if (handler) handler();
  else window.location.assign('/login');
}
