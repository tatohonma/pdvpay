import { api } from "../config/axios";

export const getClient = async (params: {}) => {
  const response = await api.get("/api/clientes", {
    params,
  });

  return response.data;
};
