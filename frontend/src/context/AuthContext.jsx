import { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
     
      const response = await fetch(`${BASE_URL}token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const userData = { username: credentials.username };
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(userData);

      return true;
    } catch (err) {
      console.error("Login failed:", err.message);
      return false;
    }
  };

 const registerUser = async (credentials) => {
  try {
    const sendUser = await fetch(`${BASE_URL}user/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        password2:credentials.password2
      }),
    });

    const data = await sendUser.json();

    if (!sendUser.ok) {
      // Return the API error message
      return { success: false, errors: data };
    }

    return { success: true };
  } catch (err) {
    console.error("Register failed:", err.message);
    return { success: false, errors: { general: ["Network error, please try again"] } };
  }
};


  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

 

  return (
    <AuthContext.Provider value={{ user, login, logout, loading,registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);