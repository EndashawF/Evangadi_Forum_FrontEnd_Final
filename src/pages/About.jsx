import React from "react";
import { NavLink } from "react-router-dom";
import "./about.css";

/**
 * About – Evangadi Forum
 */
const About = () => {
  return (
    <main className="about-container">
      {/* === Left: About Section === */}
      <section className="about-section">
        <p className="about-label">About</p>
        <h2 className="evangadi-title">Evangadi Networks</h2>

        <p className="info-text">
          Evangadi Forum is a collaborative platform where users can ask
          questions, share knowledge, and receive guidance from mentors and
          peers. Whether you're a beginner or a professional, there's a place
          for you to learn and contribute.
        </p>
        <p className="info-text">
          To use the platform, you need to <strong>log in</strong> or{" "}
          <strong>sign up</strong> if you haven't already. After logging in, you
          can ask questions, get answers, and access all your posted content
          through your profile.
        </p>

        <div className="cta-group">
          <NavLink to="/auth?tab=signup" className="btn-orange cta-btn">
            Sign-Up
          </NavLink>
          <NavLink to="/auth?tab=login" className="btn-orange cta-btn">
            Log-In
          </NavLink>
        </div>
      </section>

      {/* === Right: How It Works Steps === */}
      <section className="about-steps">
        <h3 className="steps-heading">How It Works</h3>
        <ol className="steps-list">
          <li>
            <span className="step-icon">1</span>
            <div className="step-text">
              Create an account or log in to your existing profile.
            </div>
          </li>
          <li>
            <span className="step-icon">2</span>
            <div className="step-text">
              Click on <em>Post Question</em> and write your question title.
            </div>
          </li>
          <li>
            <span className="step-icon">3</span>
            <div className="step-text">
              Add details about your question, including what you’ve tried.
            </div>
          </li>
          <li>
            <span className="step-icon">4</span>
            <div className="step-text">
              Submit your question. Community members will respond with answers.
            </div>
          </li>
          <li>
            <span className="step-icon">5</span>
            <div className="step-text">
              Revisit your profile to see your questions and answers at any
              time.
            </div>
          </li>
        </ol>
      </section>
    </main>
  );
};

export default About;
