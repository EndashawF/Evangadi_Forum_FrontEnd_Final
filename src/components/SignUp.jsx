import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { baseURL } from "../utils/api";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple client-side validation
    const { username, firstName, lastName, email, password } = formData;
    if (!username || !firstName || !lastName || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Invalid email format");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await baseURL.post("/api/auth/register", {
        username: formData.username,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate("/auth?tab=login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };
 
  return (
    <div className="">
      <div className="text-center mb-4">
        <h2>Join the network</h2>
        <p>
          Already have an account?{" "}
          <NavLink to="/auth?tab=login" style={{ color: "#f28c38" }}>
            Sign in
          </NavLink>
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Username Field */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-input"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Name Fields */}
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <input
              type="text"
              className="form-control form-input"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-input"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="mb-3">
          <input
            type="email"
            className="form-control form-input"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Field with Toggle */}
        <div className="mb-4 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control form-input pe-5"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={togglePasswordVisibility}
            style={{
              position: "absolute",
              color: "gray",
              right: "2px",
              fontSize: "15px",
              top: "50%",
              transform: "translateY(-50%)",
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

        {/* Terms Text */}
        <h6 className="my-3 text-center" style={{ fontSize: "10px" }}>
          I agree to the{" "}
          <NavLink to="#" className="auth-link" style={{ color: "#f28c38" }}>
            privacy policy
          </NavLink>{" "}
          and{" "}
          <NavLink to="#" className="auth-link" style={{ color: "#f28c38" }}>
            terms of service
          </NavLink>
        </h6>

        <button type="submit" className="btn btn-primary w-100 auth-button">
          Agree and Join
        </button>
        <div className="text-center mb-4">
          <NavLink
            to="/auth?tab=login"
            style={{ textDecoration: "none", color: "#f28c38" }}
          >
            Already have an account?{" "}
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
