import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("/api/auth/me", { withCredentials: true })
      .then((res) => {
        setLoggedIn(true);
        setRole(res.data.role);
        setUser({ email: res.data.email });
      })
      .catch(() => {
        setLoggedIn(false);
        setRole(null);
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{ role, setRole, loggedIn, setLoggedIn, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
