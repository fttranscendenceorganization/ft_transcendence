import { authFetch } from './api';

export async function getBlockedUsers() {
  const res = await authFetch('/api/users/blocked', { method: 'GET' });
  if (!res.ok) {
    throw new Error('Failed to fetch blocked users');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getFriends() {
  const res = await authFetch('/api/users/friends', { method: 'GET' });
  if (!res.ok) {
    throw new Error('Failed to fetch friends');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function sendFriendRequest(username) {
  const res = await authFetch('/api/users/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data && data.message ? data.message : 'Failed to send friend request';
    const text = Array.isArray(message) ? message[0] : message;
    const error = new Error(text);
    error.response = data;
    throw error;
  }

  return data;
}
