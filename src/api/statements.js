import api from "./client";

export const uploadStatement = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/statements/", form);
  return data;
};

export const getStatementStatus = async (id) => {
  const { data } = await api.get(`/statements/${id}/status`);
  return data;
};

export const getStatementDetail = async (id) => {
  const { data } = await api.get(`/statements/${id}`);
  return data;
};

export const confirmStatement = async (id, payload) => {
  await api.post(`/statements/${id}/confirm`, payload);
};

export const deleteStatement = async (id) => {
  await api.delete(`/statements/${id}`);
};


export const listStatements = async () => {
  const { data } = await api.get("/statements/");
  return data;
};
