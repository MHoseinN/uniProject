import api from './api';

export function getMessages(token) {
  return api.get('/messages', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
