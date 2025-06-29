import { useState, useEffect } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import SignUp from "../components/SignUp";
import SignIn from "../components/SignIn";
import "bootstrap-icons/font/bootstrap-icons.css";
const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setShowSignUp(tab === "signup");
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          {showSignUp ? <SignUp /> : <SignIn />}
        </div>
        <div className="auth-right">
          <div className="brand-logo">About</div>
          <div className="about-section">
            <h1 className="about-title">Evangadi Networks</h1>
            <p className="about-description">
              No matter what stage of life you are in, whether you're just
              starting elementary school or being promoted to CEO of a Fortune
              500 company, you have much to offer to those who are trying to
              follow in your footsteps.
            </p>
            <p className="about-description">
              Wheather you are willing to share your knowledge or you are just
              looking to meet mentors of your own, please start by joining the
              network here.
            </p>
            <NavLink to="/about" className="how-it-works">
              HOW IT WORKS
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
