import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { authenticated_user, login, logout, register } from "../api/endpoints";

const AuthContext = createContext();

/* ------------------------------------------------------------------ */
/* 🔔 ALERT MODAL (LOCAL TO THIS FILE) */
/* ------------------------------------------------------------------ */
function AlertModal({ open, onClose, title, message, type = "error" }) {
  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* ICON */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full ${
                isSuccess
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
          </div>

          {/* CONTENT */}
          <h3 className="text-xl font-semibold text-center text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-sm text-center text-gray-600">{message}</p>

          {/* ACTION */}
          <div className="mt-6">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-2.5 rounded-xl font-semibold transition shadow-md ${
                isSuccess
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              OK
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* 🧠 AUTH PROVIDER */
/* ------------------------------------------------------------------ */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "error",
  });

  const nav = useNavigate();

  const showAlert = (title, message, type = "error") => {
    setAlertConfig({ title, message, type });
    setAlertOpen(true);
  };

  const get_authenticated_user = async () => {
    try {
      const fetchedUser = await authenticated_user();
      setUser(fetchedUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (username, password) => {
    try {
      const data = await login(username, password);
      if (data && data.user) {
        setUser(data.user);
        nav("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      showAlert(
        "Login Failed",
        "Incorrect username or password. Please try again."
      );
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      nav("/login");
    }
  };

  const registerUser = async (
    username,
    email,
    password,
    confirm_password,
    role = "participant"
  ) => {
    if (password !== confirm_password) {
      showAlert(
        "Password Mismatch",
        "Passwords do not match. Please re-enter."
      );
      return;
    }

    try {
      const data = await register(username, email, password, role);
      if (data) {
        showAlert(
          "Registration Successful",
          "Your account has been created. You can now log in.",
          "success"
        );
        nav("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      showAlert(
        "Registration Failed",
        "Error registering user. Please try again."
      );
    }
  };

  useEffect(() => {
    get_authenticated_user();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        registerUser,
      }}
    >
      {children}

      {/* 🔔 GLOBAL AUTH ALERT */}
      <AlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
