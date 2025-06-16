// src/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { baseURL } from "./api";

const AuthContext = createContext({});

// Validate JWT expiration
function validateToken(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await baseURL.get("/api/auth/checkUser"); 
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Fetching user failed:", err);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (validateToken(newToken)) {
      await fetchUserData();
    } else {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      if (token && validateToken(token)) {
        await fetchUserData();
      } else {
        logout();
      }
      setIsLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
