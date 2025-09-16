// registration/layout.jsx
'use client';
import "../../styles/globals.css";
import { useSelector } from "react-redux";
import Header from "./Header/page";

export default function RegistrationLayout({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {children}
    </div>
  );
}