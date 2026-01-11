import { getToken, setToken, clearToken } from './authToken';

export async function refreshAccessToken() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function authFetch(url, options = {}) {
  let token = getToken();

  if (!token) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearToken();
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    token = getToken();
  }

  const makeRequest = async () => {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  };

  let response = await makeRequest();

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearToken();
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    token = getToken();
    response = await makeRequest();
  }

  return response;
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    clearToken();
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }
}
