const TOKEN_KEY = 'expense-tracker-token';
const USER_KEY = 'expense-tracker-user';

function read(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be disabled; auth then lives only in memory */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getToken() {
  return read(TOKEN_KEY);
}

export function setToken(token) {
  write(TOKEN_KEY, token);
}

export function getStoredUser() {
  return read(USER_KEY);
}

export function setStoredUser(user) {
  write(USER_KEY, user);
}

export function clearAuthStorage() {
  remove(TOKEN_KEY);
  remove(USER_KEY);
}
