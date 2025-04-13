export const environment = {
  production: false,
  apiUrl: '/api',
  getBaseUrl: () => {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`
  }
};

