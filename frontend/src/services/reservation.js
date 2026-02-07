import api from "./api";

export function createReservation(data, token) {
  return api.post("/reservations", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyReservations(token) {
  const { data } = await api.get("/reservations/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.map((r) => ({
    ...r,
    finalPrice:
      r.finalPrice ?? r.totalPrice + r.totalPrice * 0.1 * (r.lateHours || 0),
  }));
}

export async function getMyReservation(token, trackingCode) {
  const { data } = await api.get(`/reservations/me/${trackingCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    ...data,
    finalPrice:
      data.finalPrice ??
      data.totalPrice + data.totalPrice * 0.1 * (data.lateHours || 0),
  };
}
