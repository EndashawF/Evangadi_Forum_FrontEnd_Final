import React, { useState } from "react";
import { baseURL } from "../utils/api";
import { NavLink } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const res = await baseURL.post("/api/auth/forgot-password", { email });
      setStatus({ type: "success", message: res.data.message });
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      setStatus({ type: "error", message: msg });
    }
  };

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
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Enter your email:
            </label>
            <input
              id="email"
              type="email"
              required
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Send Password Reset Link
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

export default ForgotPassword;
