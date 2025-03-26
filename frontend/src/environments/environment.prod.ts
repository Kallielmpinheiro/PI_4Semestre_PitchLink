export const environment = {
  production: false,
  apiUrl: '/api',
  getBaseUrl: () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' ? 'http://localhost:8000' : 'http://127.0.0.1:8000';
  }
};

