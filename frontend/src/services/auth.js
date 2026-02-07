import api from './api';

export function login(identifier, password) {
  return api.post('/login', { identifier, password });
}

export function loginAdmin(username, password) {
  return api.post('/admin/login', { username, password });
}

export function register(data) {
  return api.post('/register', data);
}

export function getMe() {
  return api.get('/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
}
