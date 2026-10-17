import api from "./client";

export const loginRequest = async ({ email, password }) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const { data } = await api.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // The login is usually the first request after the API went to sleep.
    timeout: 90000
  });
  return data;
};

export const registerRequest = async ({ email, username, password }) => {
  const { data } = await api.post("/auth/register", { email, username, password });
  return data;
};

// credential = the ID token from Google Identity Services. Returns the usual token plus
// is_new_user (true when this sign-in created the account).
export const googleLoginRequest = async (credential) => {
  const { data } = await api.post(
    "/auth/google",
    { credential },
    // Like the login, usually the first request after the API went to sleep.
    { timeout: 90000 }
  );
  return data;
};

export const fetchMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

