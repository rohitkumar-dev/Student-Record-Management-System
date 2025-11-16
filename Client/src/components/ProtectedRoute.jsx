import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const { loggedIn } = useContext(AuthContext);

  if (!loggedIn) return <Navigate to="/auth" />;

  return children;
}
