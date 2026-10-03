import { create } from "zustand";
import { clearAll } from "../offline/storage";

const storedToken = localStorage.getItem("access_token");

export const useAuthStore = create((set) => ({
  accessToken: storedToken || null,
  user: null,

  setToken: (token) =>
    set(() => {
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
      return { accessToken: token };
    }),

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("access_token");
    // Cached carts and lists belong to this account.
    clearAll();
    set({ accessToken: null, user: null });
  }
}));

