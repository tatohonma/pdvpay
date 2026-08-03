import { api } from "../config/axios";

interface openCommandProps {
  ClienteID: number;
  Comanda: number;
  IDTipoEntrada: number;
  PDVID: number;
  UsuarioID: number;
  Validar: boolean;
}

export const openCommand = async (data: openCommandProps) => {
  const response = await api.post("/api/comandas/abrir", data);
  return response.data;
};

export const getCommandEntry = async () => {
  const response = await api.get("/api/comandas/tipoentradas");
  return response.data;
};
