/**
 * Ask question page for Evangadi Forum
 * Production Summary: Provides a form to ask a new public question.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils/api";
import "../index.css";

const Ask = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await baseURL.post("/api/question", formData);
    navigate("/");
  };

  return (
    <div className="ask-page">
      <div className="ask-content">
        <h2>Steps to write a good question</h2>
        <ul>
          <li>Summerize your problem in a one-line title.</li>
          <li>Describe your problem in more detail.</li>
          <li>Describe what you tried and what you expected to happen.</li>
          <li>Review your question and post it to the site.</li>
        </ul>
        <form className="ask-form" onSubmit={handleSubmit}>
          <h3>Ask a public question</h3>
          <p>Go to Question page</p>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Question Description..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
          <button type="submit" className="ask-btn">
            Post Your Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default Ask;
