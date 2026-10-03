import api from "./client";

// currency: "UYU" | "USD" | undefined (undefined sums both, like before)
export const getSummary = async (currency) => {
  const { data } = await api.get("/stats/summary", { params: { currency } });
  return data;
};

export const getByMonth = async (months = 6, currency) => {
  const { data } = await api.get("/stats/by-month", { params: { months, currency } });
  return data;
};

export const getByCategory = async (period = "all", currency) => {
  const { data } = await api.get("/stats/by-category", { params: { period, currency } });
  return data;
};

export const getByBank = async (period = "all", currency) => {
  const { data } = await api.get("/stats/by-bank", { params: { period, currency } });
  return data;
};

export const getTopMerchants = async (limit = 10, period = "all", currency) => {
  const { data } = await api.get("/stats/top-merchants", { params: { limit, period, currency } });
  return data;
};

export const getTrends = async (days = 30, currency) => {
  const { data } = await api.get("/stats/trends", { params: { days, currency } });
  return data;
};

// One confirmed statement broken down by currency and category (latest when
// statementId is omitted). Returns null when there's no confirmed statement.
export const getStatementReport = async (statementId) => {
  const { data } = await api.get("/stats/statement-report", {
    params: { statement_id: statementId || undefined },
  });
  return data;
};

export const getTransactions = async (params = {}) => {
  const { data } = await api.get("/transactions", { params });
  return data;
};

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`);
};
