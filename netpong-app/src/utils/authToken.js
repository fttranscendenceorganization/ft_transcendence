let ACCESS_TOKEN = null;

export const setToken = (token) => {
  ACCESS_TOKEN = token || null;
};

export const getToken = () => ACCESS_TOKEN;

export const clearToken = () => {
  ACCESS_TOKEN = null;
};
