import React, { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  getCurrentUser: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Daftar akun admin (bisa dikembangkan ke backend nantinya)
const ADMIN_USERS = [
  { username: "Rizki", password: "admin123" },
  { username: "Lely", password: "12345" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    const storedUser = localStorage.getItem("currentUser");

    // Memeriksa status login pengguna
    if (adminAuth === "true" && storedUser) {
      setIsAdmin(true);
      setCurrentUser(storedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = ADMIN_USERS.find(
      (u) => u.username === username && u.password === password
    );
    
    if (user) {
      setIsAdmin(true);
      setCurrentUser(username);
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("currentUser", username); // Menyimpan user yang login
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("currentUser"); // Menghapus data pengguna dari localStorage
  };

  const getCurrentUser = () => {
    return currentUser;
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
