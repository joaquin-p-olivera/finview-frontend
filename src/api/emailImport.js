import api from "./client";

// Import by email: the user's forwarding address, Gmail's forwarding
// confirmation and the latest forwarded statements.
export const getEmailImport = async () => {
  const { data } = await api.get("/email-import");
  return data;
};

export const regenerateEmailImportAddress = async () => {
  const { data } = await api.post("/email-import/token");
  return data;
};
