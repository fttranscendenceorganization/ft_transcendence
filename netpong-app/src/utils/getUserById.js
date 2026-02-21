import { authFetch } from './api';

export async function getUserById(userId) {
  const res = await authFetch(`/api/users/${userId}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }
  return await res.json();
}
