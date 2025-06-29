import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { baseURL } from "../utils/api";
import { NavLink } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const res = await baseURL.post("/api/auth/reset-password", {
        token,
       newPassword,
      });
      setStatus({ type: "success", message: res.data.message });
      setTimeout(() => navigate("/auth?tab=login"), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      setStatus({ type: "error", message: msg });
    }
  };
   console.log(newPassword, "newPassword");
  return (
    <div
      className="container d-flex align-items-center justify-content-center mt-5"
      style={{ minHeight: "10vh" }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "20px" }}
      >
        <h2 className="mb-4 text-center">Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            {/* <label htmlFor="newPassword" className="form-label">
              Enter new password:
            </label> */}
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className="form-control pe-5" // Added right padding
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2"
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute !important",
                color: "gray",
                right: "2px",
                fontSize: "15px",
                top: "50%",
                transform: "translateY(-50%) !important",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              {showPassword ? (
                <i className="bi bi-eye-slash-fill"></i>
              ) : (
                <i className="bi bi-eye-fill"></i>
              )}
            </button>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Reset Password
          </button>
        </form>

        {status.message && (
          <div
            className={`alert ${
              status.type === "error" ? "alert-danger" : "alert-success"
            } mt-3`}
          >
            {status.message}
          </div>
        )}

        <p className="text-center mt-4">
          Remembered password?{" "}
          <NavLink to="/auth?tab=login" style={{ color: "#f28c38" }}>
            Login here
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
