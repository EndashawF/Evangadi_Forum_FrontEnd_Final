// Import necessary dependencies
import React from "react"; // Core React library
import { NavLink } from "react-router-dom"; // For navigation links
import "./about.css"; // Component-specific styles
import { useAuth } from "../utils/auth"; // Authentication context/hook

/**
 * About Component - Displays information about Evangadi Forum
 *
 * @description This component renders the About page with two main sections:
 * 1. Information about the platform
 * 2. Step-by-step guide on how to use the forum
 *
 * @returns {JSX.Element} The About page component
 */
const About = () => {
  // Get authentication status from context
  const { isAuthenticated } = useAuth();

  return (
    // Main container for the About page
    <main className="about-container">
      {/* ============================================= */}
      {/* LEFT SECTION: Platform Information */}
      {/* ============================================= */}
      <section className="about-section">
        {/* Section label */}
        <p className="about-label">About</p>

        {/* Main title */}
        <h2 className="evangadi-title">Evangadi Networks</h2>

        {/* Platform description paragraphs */}
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

        {/* Conditional render of login button for unauthenticated users */}
        {!isAuthenticated && (
          <div className="cta-group">
            <NavLink to="/auth?tab=login" className="btn-orange cta-btn">
              Log-In
            </NavLink>
          </div>
        )}
      </section>

      {/* ============================================= */}
      {/* RIGHT SECTION: How It Works Steps */}
      {/* ============================================= */}
      <section className="about-steps">
        {/* Section heading */}
        <h3 className="steps-heading">How It Works</h3>

        {/* Ordered list of steps */}
        <ol className="steps-list">
          {/* Step 1 */}
          <li>
            <span className="step-icon">1</span>
            <div className="step-text">
              Create an account or log in to your existing profile.
            </div>
          </li>

          {/* Step 2 */}
          <li>
            <span className="step-icon">2</span>
            <div className="step-text">
              Click on <em>Post Question</em> and write your question title.
            </div>
          </li>

          {/* Step 3 */}
          <li>
            <span className="step-icon">3</span>
            <div className="step-text">
              Add details about your question, including what you've tried.
            </div>
          </li>

          {/* Step 4 */}
          <li>
            <span className="step-icon">4</span>
            <div className="step-text">
              Submit your question. Community members will respond with answers.
            </div>
          </li>

          {/* Step 5 */}
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
