import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { baseURL } from "../utils/api";
import { useAuth } from "../utils/auth";
import { format } from "date-fns";
// import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";

const Question = () => {
  const { questionid } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editQuestion, setEditQuestion] = useState({
    title: "",
    description: "",
  });
  const [editAnswer, setEditAnswer] = useState({ answerid: "", answer: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // Fetch question and answers
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [qResponse, aResponse] = await Promise.all([
        baseURL.get(`/api/question/${questionid}`),
        baseURL.get(`/api/answer/${questionid}`).catch((err) => {
          if (err.response?.status === 404) return { data: { answers: [] } };
          throw err;
        }),
      ]);
      setQuestion(qResponse.data);
      setAnswers(aResponse.data.answers || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [questionid]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?tab=login");
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, fetchData]);

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      logout();
      navigate("/auth?tab=login");
    } else {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) {
      setError("Answer cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await baseURL.post("/api/answer", { questionid, answer: newAnswer });
      setNewAnswer("");
      setError("");
      await fetchData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (!editQuestion.title.trim() || !editQuestion.description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await baseURL.put(`/api/content/${questionid}`, {
        type: "question",
        title: editQuestion.title,
        description: editQuestion.description,
      });

      if (response.data.success) {
        setQuestion((prev) => ({ ...prev, ...editQuestion }));
        setError("");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editQuestionModal")
        );
        if (modal) modal.hide();
      } else {
        setError(response.data.error || "Failed to update question");
      }
    } catch (err) {
      console.error("Edit error:", err);
      setError(
        err.response?.data?.error ||
          "An error occurred while updating the question"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAnswer = async (e) => {
    e.preventDefault();
    if (!editAnswer.answer.trim()) {
      setError("Answer cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await baseURL.put(
        `/api/content/${editAnswer.answerid}`,
        {
          type: "answer",
          answer: editAnswer.answer,
        }
      );

      if (response.data.success) {
        setAnswers((prev) =>
          prev.map((a) =>
            a.answerid === editAnswer.answerid
              ? { ...a, answer: editAnswer.answer }
              : a
          )
        );
        setError("");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editAnswerModal")
        );
        if (modal) modal.hide();
      } else {
        setError(response.data.error || "Failed to update answer");
      }
    } catch (err) {
      console.error("Edit error:", err);
      setError(
        err.response?.data?.error ||
          "An error occurred while updating the answer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      setIsSubmitting(true);
      await baseURL.delete(`/api/content/${id}`, { params: { type } });

      if (type === "question") {
        navigate("/");
      } else {
        setAnswers((prev) => prev.filter((a) => a.answerid !== id));
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditQuestionModal = () => {
    setEditQuestion({
      title: question.title,
      description: question.description,
    });
    const modalElement = document.getElementById("editQuestionModal");
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  const openEditAnswerModal = (answer) => {
    setEditAnswer({
      answerid: answer.answerid,
      answer: answer.answer,
    });
    const modalElement = document.getElementById("editAnswerModal");
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  if (isLoading)
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (!question)
    return (
      <div className="container mt-4 alert alert-danger">
        {error || "Question not found"}
      </div>
    );

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary">
        &larr; Back to Questions
      </Link>

      {/* Question Section */}
      <article className="card">
        <div className="card-body">
          <h4 className="card-title">{question.title}</h4>
          <p className="card-text">{question.description}</p>
          <footer className="text-muted">Posted by {question.username}</footer>
          <small
            className="text-muted"
            style={{ paddingLeft: "0px", fontSize: "10px" }}
          >
            {format(new Date(question.created_at), "MMM d, yyyy, hh:mm a")}
          </small>

          {user?.userid === question.userid && (
            <div className="mt-3">
              <button
                className="btn btn-warning me-2"
                onClick={openEditQuestionModal}
              >
                Edit Question
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(questionid, "question")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Question"}
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Answers Section */}
      <section className="mx-2">
        <h5>Answers ({answers.length})</h5>
        {error && <div className="alert alert-danger">{error}</div>}

        {answers.length === 0 ? (
          <div className="alert alert-info">
            No answers yet. Be the first to respond!
          </div>
        ) : (
          <div className="list-group">
            {answers.map((answer) => (
              <article key={answer.answerid} className="list-group-item">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={materialOceanic}
                          language={match[1]}
                          PreTag="div"
                          wrapLongLines
                          showLineNumbers
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                        className="bg-white text-black p-1 rounded font-mono"
                        {...props}>
                        {children}
                      </code>
                      );
                    },
                  }}
                >
                  {answer.answer}
                </ReactMarkdown>
                <small className="text-muted">
                  Posted by {answer.username}
                </small>
                <small
                  className="text-muted"
                  style={{ paddingLeft: "10px", fontSize: "10px" }}
                >
                  {format(new Date(answer.created_at), "MMM d, yyyy, hh:mm a")}
                </small>

                {user?.userid === answer.userid && (
                  <div className="mt-2">
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditAnswerModal(answer)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(answer.answerid, "answer")}
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Answer Form */}
      <section className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Post Your Answer</h5>
          <form onSubmit={handleAnswerSubmit}>
            <div className="mb-3">
              <textarea
                className="form-control"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer here..."
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !newAnswer.trim()}
            >
              {isSubmitting ? "Posting..." : "Post Answer"}
            </button>
          </form>
        </div>
      </section>

      {/* Edit Question Modal */}
      <div
        className="modal fade"
        id="editQuestionModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Question</h2>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditQuestion}>
                <div className="mb-3">
                  <label htmlFor="editTitle" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTitle"
                    value={editQuestion.title}
                    onChange={(e) =>
                      setEditQuestion((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="editDescription"
                    value={editQuestion.description}
                    onChange={(e) =>
                      setEditQuestion((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={5}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Answer Modal */}
      <div
        className="modal fade"
        id="editAnswerModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Answer</h2>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditAnswer}>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    value={editAnswer.answer}
                    onChange={(e) =>
                      setEditAnswer((prev) => ({
                        ...prev,
                        answer: e.target.value,
                      }))
                    }
                    rows={5}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
