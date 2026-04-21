// context/useAuth.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";

import {
  authenticated_user,
  login,
  logout,
  register,
  googleLogin,
} from "../api/endpoints";

const AuthContext = createContext();

/* ------------------------------------------------------------------ */
/* 🔔 ALERT MODAL */
/* ------------------------------------------------------------------ */
function AlertModal({ open, onClose, title, message, type = "error" }) {
  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
        <motion.div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

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

          <h3 className="text-xl font-semibold text-center text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-sm text-center text-gray-600">{message}</p>

          <div className="mt-6">
            <motion.button
              onClick={onClose}
              className={`w-full py-2.5 rounded-xl font-semibold ${
                isSuccess
                  ? "bg-green-600 text-white"
                  : "bg-purple-600 text-white"
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
  const [authChecked, setAuthChecked] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "error",
  });

  const nav = useNavigate();
  const location = useLocation();

  const showAlert = useCallback((title, message, type = "error") => {
    setAlertConfig({ title, message, type });
    setAlertOpen(true);
  }, []);

  /* ------------------------------------------------------------------ */
  /* 🔍 SESSION CHECK */
  /* ------------------------------------------------------------------ */
  const get_authenticated_user = useCallback(async () => {
    try {
      const fetchedUser = await authenticated_user();
      setUser(fetchedUser);

      if (!fetchedUser) return;

      // 🔥 USERNAME FLOW
      if (
        fetchedUser.needs_username &&
        location.pathname !== "/set-username"
      ) {
        nav("/set-username", { replace: true });
        return;
      }

      // 🔥 PASSWORD FLOW
      if (
        !fetchedUser.has_password &&
        !fetchedUser.needs_username &&
        location.pathname !== "/set-password"
      ) {
        nav("/set-password", { replace: true });
        return;
      }

    } catch {
      setUser(null);

      const publicRoutes = ["/login", "/register"];
      if (!publicRoutes.includes(location.pathname)) {
        nav("/login", { replace: true });
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, [nav, location.pathname]);

  /* ------------------------------------------------------------------ */
  /* 🔐 EMAIL LOGIN */
  /* ------------------------------------------------------------------ */
  const loginUser = useCallback(
    async (email, password) => {
      try {
        setLoading(true);

        const data = await login(email, password);

        if (data?.user) {
          setUser(data.user);

          if (data.user.needs_username) {
            nav("/set-username", { replace: true });
          } else if (!data.user.has_password) {
            nav("/set-password", { replace: true });
          } else {
            nav("/", { replace: true });
          }
        }
      } catch (error) {
        const msg =
          error?.response?.data?.detail ||
          "Invalid email or password";

        showAlert("Login Failed", msg);
      } finally {
        setLoading(false);
      }
    },
    [nav, showAlert]
  );

  /* ------------------------------------------------------------------ */
  /* 🔐 GOOGLE LOGIN */
  /* ------------------------------------------------------------------ */
  const googleLoginUser = useCallback(
    async (id_token) => {
      try {
        setLoading(true);

        await googleLogin(id_token);

        const user = await authenticated_user();

        if (!user) throw new Error("User fetch failed");

        setUser(user);

        if (user.needs_username) {
          nav("/set-username", { replace: true });
        } else if (!user.has_password) {
          nav("/set-password", { replace: true });
        } else {
          nav("/", { replace: true });
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          "Google login failed. Try again.";

        showAlert("Google Login Failed", msg);
      } finally {
        setLoading(false);
      }
    },
    [nav, showAlert]
  );

  /* ------------------------------------------------------------------ */
  /* 📝 REGISTER */
  /* ------------------------------------------------------------------ */
  const registerUser = useCallback(
    async (email, password, confirm_password, role = "participant") => {
      if (password !== confirm_password) {
        showAlert("Password Mismatch", "Passwords do not match.");
        return;
      }

      try {
        setLoading(true);

        await register(email, password, role);

        showAlert(
          "Registration Successful",
          "You can now log in.",
          "success"
        );

        nav("/login");
      } catch {
        showAlert("Registration Failed", "Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [nav, showAlert]
  );

  /* ------------------------------------------------------------------ */
  /* 🚪 LOGOUT */
  /* ------------------------------------------------------------------ */
  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      nav("/login", { replace: true });
    }
  }, [nav]);

  /* ------------------------------------------------------------------ */
  /* INIT */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    get_authenticated_user();
  }, [get_authenticated_user]);

  /* ------------------------------------------------------------------ */
  /* CONTEXT */
  /* ------------------------------------------------------------------ */
  const value = useMemo(
    () => ({
      user,
      loading,
      authChecked,
      isAuthenticated: !!user,
      loginUser,
      googleLoginUser,
      logoutUser,
      registerUser,
      showAlert,
    }),
    [
      user,
      loading,
      authChecked,
      loginUser,
      googleLoginUser,
      logoutUser,
      registerUser,
      showAlert,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

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

/* ------------------------------------------------------------------ */
/* 🔗 HOOK */
/* ------------------------------------------------------------------ */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};