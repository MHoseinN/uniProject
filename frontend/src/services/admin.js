import api from "./api";

function auth() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

// Debug function to test API connectivity
export async function testConnection() {
  try {
    const response = await api.get("/");
    console.log("API connection test successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("API connection test failed:", error);
    throw error;
  }
}

// pending users
export function getPendingUsers() {
  return api.get("/admin/pending-users", auth());
}

export function approveUser(id) {
  return api.post(`/admin/pending-users/${id}/approve`, {}, auth());
}

export function rejectUser(id) {
  return api.post(`/admin/pending-users/${id}/reject`, {}, auth());
}

// approved users
export function getApprovedUsers() {
  return api.get("/admin/users", auth());
}

export function deleteUser(id) {
  return api.delete(`/admin/users/${id}`, auth());
}

// product management
export function getProducts() {
  return api.get("/products", auth());
}

export function createProduct(data) {
  return api.post("/admin/products", data, auth());
}

export function updateProduct(id, data) {
  return api.patch(`/admin/products/${id}`, data, auth());
}

export function deleteProduct(id) {
  return api.delete(`/admin/products/${id}`, auth());
}

// reservations
export function getReservations() {
  return api.get("/admin/reservations", auth());
}

export function updateReservation(code, data) {
  return api.patch(`/admin/reservations/${code}`, data, auth());
}

// income
export function getIncome() {
  return api.get("/admin/income", auth());
}
