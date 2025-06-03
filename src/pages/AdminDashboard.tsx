import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { logout, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
      <p>Selamat datang, <strong>{getCurrentUser()}</strong></p>
      <Button onClick={handleLogout} className="mt-4 bg-red-600 hover:bg-red-700">
        Logout
      </Button>
    </div>
  );
};

export default AdminDashboard;
