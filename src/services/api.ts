const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = RAW_API_URL.replace(/\/+$/, "");

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function buildUrl(endpoint: string, params?: Record<string, unknown>) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = endpoint.startsWith("http") ? endpoint : `${API_URL}${cleanEndpoint}`;
  const url = new URL(fullUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function request(
  endpoint: string,
  method: HttpMethod,
  data?: unknown,
  isFormData = false,
  params?: Record<string, unknown>,
) {
  const token = localStorage.getItem("accessToken");
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data !== undefined) {
    config.body = isFormData ? (data as BodyInit) : JSON.stringify(data);
  }

  const response = await fetch(buildUrl(endpoint, params), config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
    }
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error) errorMsg = errorData.error;
    } catch {
      // Keep the HTTP status fallback.
    }
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : undefined;
}

export const api = {
  get: (endpoint: string, params?: Record<string, unknown>) =>
    request(endpoint, "GET", undefined, false, params),
  post: (endpoint: string, data?: unknown, isFormData = false) =>
    request(endpoint, "POST", data, isFormData),
  put: (endpoint: string, data?: unknown, isFormData = false) =>
    request(endpoint, "PUT", data, isFormData),
  del: (endpoint: string) => request(endpoint, "DELETE"),
  patch: (endpoint: string, data?: unknown) => request(endpoint, "PATCH", data),

  register: (data: { email: string; password: string; name?: string }) =>
    request("/auth/register", "POST", data),
  login: (data: { email: string; password: string }) => request("/auth/login", "POST", data),
  refresh: () => request("/auth/refresh", "POST", {}),
  logout: () => request("/auth/logout", "POST", {}),
  requestPasswordReset: (email: string) =>
    request("/auth/request-password-reset", "POST", { email }),
  resetPassword: (token: string, password: string) =>
    request("/auth/reset-password", "POST", { token, password }),

  getMe: () => request("/users/me", "GET"),
  updateUser: (id: string, data: Partial<{ name: string; email: string }>) =>
    request(`/users/${id}`, "PUT", data),
  becomeVendor: () => request("/users/become-vendor", "POST"),

  getProducts: (params?: Record<string, unknown>) =>
    request("/products", "GET", undefined, false, params),
  getProduct: (id: string) => request(`/products/${id}`, "GET"),
  createProduct: (data: FormData) => request("/products", "POST", data, true),
  updateProduct: (id: string, data: FormData | object) =>
    request(`/products/${id}`, "PUT", data, data instanceof FormData),
  deleteProduct: (id: string) => request(`/products/${id}`, "DELETE"),

  getOrders: (params?: Record<string, unknown>) =>
    request("/orders", "GET", undefined, false, params),
  getOrder: (id: string) => request(`/orders/${id}`, "GET"),
  getVendorOrders: () => request("/orders/vendor", "GET"),
  updateVendorOrderStatus: (id: string, status: string) =>
    request(`/orders/vendor/${id}/status`, "PATCH", { status }),
  createOrder: (data: unknown) => request("/orders", "POST", data),
  updateOrderStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, "PATCH", { status }),

  getCart: () => request("/cart", "GET"),
  addToCart: (productId: string, quantity: number) =>
    request("/cart/items", "POST", { productId, quantity }),
  updateCartItem: (itemId: string, data: number | { quantity: number }) =>
    request(`/cart/items/${itemId}`, "PUT", typeof data === "number" ? { quantity: data } : data),
  removeFromCart: (itemId: string) => request(`/cart/items/${itemId}`, "DELETE"),
  clearCart: () => request("/cart", "DELETE"),
  getCartCount: () => request("/cart/count", "GET"),

  getWishlist: () => request("/wishlist", "GET"),
  addToWishlist: (productId: string) => request("/wishlist", "POST", { productId }),
  removeFromWishlist: (productId: string) => request(`/wishlist/${productId}`, "DELETE"),

  getReviews: (productId: string, params?: Record<string, unknown>) =>
    request("/reviews", "GET", undefined, false, { productId, ...params }),
  createReview: (data: unknown) => request("/reviews", "POST", data),

  validateCoupon: (code: string) => request("/coupons/validate", "POST", { code }),

  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/upload", "POST", formData, true);
  },

  searchProducts: (query: string, params?: Record<string, unknown>) =>
    request("/search", "GET", undefined, false, { q: query, ...params }),

  // Vendor sub-orders
  getVendorSubOrders: () => request("/orders/vendor", "GET"),
  updateVendorSubOrderStatus: (id: string, status: string) =>
    request(`/orders/vendor/${id}/status`, "PATCH", { status }),

  // Invoices
  getInvoices: () => request("/invoices", "GET"),
  getInvoice: (id: string) => request(`/invoices/${id}`, "GET"),

  // Delivery
  getShipments: () => request("/delivery/shipments", "GET"),
  updateShipmentStatus: (id: string, status: string, trackingNumber?: string) =>
    request(`/delivery/shipments/${id}/status`, "PATCH", { status, trackingNumber }),
  getDeliveryConfig: () => request("/delivery/config", "GET"),
  updateDeliveryConfig: (data: unknown) => request("/delivery/config", "PUT", data),

  // Payment confirmation
  confirmPayment: (data: { paymentId: string; orderId: string; providerPaymentId?: string }) =>
    request("/payment/confirm", "POST", data),

  // Admin
  getAdminStats: () => request("/admin/stats", "GET"),
  getAdminUsers: (params?: Record<string, unknown>) => request("/admin/users", "GET", undefined, false, params),
  updateAdminUser: (id: string, data: unknown) => request(`/admin/users/${id}`, "PUT", data),

  getAdminSettings: () => request("/admin/settings", "GET"),
  updateAdminSetting: (key: string, value: unknown, description?: string) =>
    request("/admin/settings", "PUT", { key, value, description }),

  getPaymentProviders: () => request("/admin/payment-providers", "GET"),
  updatePaymentProvider: (id: string, data: unknown) => request(`/admin/payment-providers/${id}`, "PUT", data),

  getDeliveryProviders: () => request("/admin/delivery-providers", "GET"),
  updateDeliveryProvider: (id: string, data: unknown) => request(`/admin/delivery-providers/${id}`, "PUT", data),

  getAdminInvoices: () => request("/admin/invoices", "GET"),
  getAdminCommissions: () => request("/admin/commissions", "GET"),

  getAdminAllOrders: (params?: Record<string, unknown>) =>
    request("/orders/all", "GET", undefined, false, params),
};

export function initializeAuth() {
  const token = localStorage.getItem("accessToken");
  return Boolean(token);
}
