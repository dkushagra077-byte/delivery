const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

class ApiClient {
  static getToken() {
    return localStorage.getItem('token');
  }

  static setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errorCode = data.errorCode || 'UNKNOWN_ERROR';
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw structured error
      throw err;
    }
  }

  static get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  static put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  static delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// API Endpoints grouped by domain
export const authApi = {
  login: (credentials) => ApiClient.post('/auth/login', credentials),
  register: (userData) => ApiClient.post('/auth/register', userData),
  logout: () => ApiClient.post('/auth/logout'),
  getMe: () => ApiClient.get('/auth/me'),
  changePassword: (data) => ApiClient.post('/auth/change-password', data)
};

export const ordersApi = {
  create: (orderData) => ApiClient.post('/orders', orderData),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return ApiClient.get(`/orders${query ? `?${query}` : ''}`);
  },
  getById: (id) => ApiClient.get(`/orders/${id}`),
  cancel: (id, reason) => ApiClient.post(`/orders/${id}/cancel`, { reason })
};

export const deliveriesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return ApiClient.get(`/deliveries${query ? `?${query}` : ''}`);
  },
  getById: (id) => ApiClient.get(`/deliveries/${id}`),
  updateStatus: (id, payload) => ApiClient.put(`/deliveries/${id}/status`, payload),
  assignDriver: (id, driverId) => ApiClient.post(`/deliveries/${id}/assign`, { driverId }),
  getTimeline: (id) => ApiClient.get(`/deliveries/${id}/timeline`)
};

export const trackingApi = {
  recordLocation: (locationData) => ApiClient.post('/tracking/location', locationData),
  getLatest: (deliveryId) => ApiClient.get(`/tracking/${deliveryId}/latest`),
  getHistory: (deliveryId) => ApiClient.get(`/tracking/${deliveryId}/history`)
};

export const driversApi = {
  getMyProfile: () => ApiClient.get('/drivers/profile'),
  updateStatus: (status) => ApiClient.put('/drivers/status', { status }),
  updateVehicle: (vehicleData) => ApiClient.put('/drivers/vehicle', vehicleData),
  getMyDeliveries: () => ApiClient.get('/drivers/deliveries'),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return ApiClient.get(`/drivers${query ? `?${query}` : ''}`);
  }
};

export const notificationsApi = {
  getAll: () => ApiClient.get('/notifications'),
  markAsRead: (id) => ApiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => ApiClient.put('/notifications/read-all')
};

export const adminApi = {
  getStats: () => ApiClient.get('/admin/stats'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return ApiClient.get(`/admin/users${query ? `?${query}` : ''}`);
  },
  toggleUserStatus: (id) => ApiClient.put(`/admin/users/${id}/toggle-status`),
  getDrivers: () => ApiClient.get('/admin/drivers')
};

export const userApi = {
  getProfile: () => ApiClient.get('/users/profile'),
  updateProfile: (data) => ApiClient.put('/users/profile', data),
  getAddresses: () => ApiClient.get('/users/addresses'),
  addAddress: (data) => ApiClient.post('/users/addresses', data)
};

export default ApiClient;
