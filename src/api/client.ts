import { api } from "../config/axios";

export type ClientSearchParams = {
  documento?: string;
  telefone?: string;
};

export const getClient = async (params: ClientSearchParams) => {
  const response = await api.get("/api/clientes", {
    params,
  });

  return response.data;
};

export type InsertClientRequest = {
  NomeCompleto: string;
  Documento1?: string;
  RG?: string;
  /** "aaaa-mm-dd" */
  DtNascimento?: string;
  Telefone1DDD?: number;
  Telefone1Numero?: number;
};

// A API responde 200 mesmo em erro de validação: sucesso é Id > 0
export type InsertClientResponse = {
  Id: number;
  Codigo: number;
  Mensagem: string;
};

export const insertClient = async (data: InsertClientRequest) => {
  const response = await api.post<InsertClientResponse>(
    "/api/clientes/inserir",
    data,
  );

  return response.data;
};
