/**
 * Component for creating a new question
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils/api";
import { useAuth } from "../utils/auth";
import TagInput from "../components/TagInput";

const AskQuestion = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?tab=login", { replace: true });
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await baseURL.get("/api/category");
        setCategories(response.data.categories.map(cat => cat.name));
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      setError("Title, description, and category are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await baseURL.post("/api/question", {
        title,
        description,
        category,
        tags,
      });
      console.log('Create question response:', response.data);
      setError("");
      navigate(`/question/${response.data.questionid}`);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/auth?tab=login", { replace: true });
      } else {
        setError(err.response?.data?.error || "Failed to create question");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Ask a Question</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            className="form-control"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <TagInput
          initialTags={tags}
          onTagsChange={(newTags) => {
            console.log('Tags changed:', newTags);
            setTags(newTags);
          }}
        />
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Question"}
        </button>
      </form>
    </div>
  );
};

export default AskQuestion;