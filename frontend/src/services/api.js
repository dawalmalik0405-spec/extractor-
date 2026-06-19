import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 0,
});

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  return error.response?.data?.detail || error.message || fallback;
}

export default api;
