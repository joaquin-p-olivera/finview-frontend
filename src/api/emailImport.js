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

// Passwords of protected statement PDFs, one per bank. The backend stores them
// encrypted and never returns them: the list only has the bank names.
export const getBankPasswords = async () => {
  const { data } = await api.get("/email-import/pdf-passwords");
  return data;
};

export const saveBankPassword = async ({ bank_name, password }) => {
  const { data } = await api.put("/email-import/pdf-passwords", { bank_name, password });
  return data;
};

export const deleteBankPassword = async (id) => {
  await api.delete(`/email-import/pdf-passwords/${id}`);
};

// Turn the "statement arrived" notice email on or off. Returns the same data as
// getEmailImport, with the saved `notifications` value.
export const setEmailImportNotifications = async (enabled) => {
  const { data } = await api.put("/email-import/notifications", { enabled });
  return data;
};
