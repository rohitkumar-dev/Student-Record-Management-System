import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const { loggedIn, setLoggedIn, role, user, setRole, setUser } =
    useContext(AuthContext);

  const [open, setOpen] = useState(false);

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setLoggedIn(false);
      setRole(null);
      setUser(null);
      navigate("/auth");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="w-full bg-gray-900 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <div className="font-semibold">{loggedIn ? user?.email : "Hello"}</div>

      <div className="hidden md:block text-lg font-medium">
        {loggedIn
          ? role === "admin"
            ? "Admin User"
            : "General User"
          : "Welcome"}
      </div>

      <div className="flex items-center gap-4">
        {loggedIn ? (
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        ) : (
          <Button onClick={() => navigate("/auth")}>Login</Button>
        )}

        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {open && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 text-white p-4 flex flex-col gap-3 md:hidden">
          <div className="font-semibold">{loggedIn ? user?.email : "Hi"}</div>
          <div className="text-lg font-medium">
            {loggedIn
              ? role === "admin"
                ? "Admin User"
                : "General User"
              : "Welcome"}
          </div>

          {loggedIn ? (
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth")}>Login</Button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Header;
