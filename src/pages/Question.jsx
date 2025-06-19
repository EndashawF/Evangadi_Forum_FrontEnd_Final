import React,{ useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { baseURL } from "../utils/api";
import { useAuth } from "../utils/auth";
import { format } from "date-fns";
// import ReactMarkdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import StarRating from "../components/StarRating";
import TagInput from "../components/TagInput";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";

// Custom code block blot for Quill
const CodeBlock = Quill.import("formats/code-block");

class CustomCodeBlock extends CodeBlock {
  static create(value) {
    const node = super.create();
    const { language, code } = JSON.parse(value);
    node.innerHTML = code;
    node.setAttribute("data-language", language);
    return node;
  }

  static value(domNode) {
    return JSON.stringify({
      language: domNode.getAttribute("data-language"),
      code: domNode.innerHTML,
    });
  }
}

CustomCodeBlock.blotName = "code-block";
CustomCodeBlock.tagName = "pre";
CustomCodeBlock.className = "ql-syntax";
Quill.register(CustomCodeBlock, true);

const CustomToolbar = ({ editorRef }) => {
  const insertCodeBlock = useCallback(() => {
    const editor = editorRef.current?.getEditor();
    const range = editor?.getSelection();
    if (range) {
      const language = prompt(
        "Enter language (e.g., javascript, python):",
        "javascript"
      );
      if (language) {
        const code = prompt("Enter your code:");
        if (code) {
          editor.insertText(range.index, "\n");
          editor.insertEmbed(
            range.index,
            "code-block",
            JSON.stringify({ language, code })
          );
          editor.insertText(range.index + 1, "\n");
        }
      }
    }
  }, [editorRef]);

  return (
    <div id="toolbar" className="border-b border-gray-200">
      <button className="ql-bold" title="Bold"></button>
      <button className="ql-italic" title="Italic"></button>
      <button className="ql-underline" title="Underline"></button>
      <button className="ql-strike" title="Strikethrough"></button>
      <select className="ql-header" title="Heading">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option selected>Normal</option>
      </select>
      <button className="ql-list" value="ordered" title="Ordered List"></button>
      <button className="ql-list" value="bullet" title="Bullet List"></button>
      <button
        className="ql-code-block"
        onClick={insertCodeBlock}
        title="Code Block"
      >
        <svg viewBox="0 0 18 18">
          <polygon points="6,12 4,10 7.5,6.5 4,3 6,1 11,6.5"></polygon>
          <polygon points="12,12 14,10 10.5,6.5 14,3 12,1 7,6.5"></polygon>
        </svg>
      </button>
      <button className="ql-link" title="Link"></button>
      <button className="ql-clean" title="Clear Formatting"></button>
    </div>
  );
};

const AnswerItem = React.memo(
  ({ answer, onEdit, onDelete, user, onRatingChange, editorRef }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(answer.answer);

    const handleSubmitEdit = async (e) => {
      e.preventDefault();
      const cleanAnswer = DOMPurify.sanitize(editContent);
      if (!cleanAnswer.trim() || cleanAnswer === "<p><br></p>") return;

      try {
        await onEdit(answer.answerid, cleanAnswer);
        setEditing(false);
      } catch (error) {
        console.error("Failed to update answer:", error);
      }
    };

    return (
      <article className="list-group-item">
        {editing ? (
          <form onSubmit={handleSubmitEdit}>
            <CustomToolbar editorRef={editorRef} />
            <ReactQuill
              ref={editorRef}
              theme="snow"
              value={editContent}
              onChange={setEditContent}
              modules={{
                toolbar: { container: "#toolbar" },
                clipboard: { matchVisual: false },
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "list",
                "bullet",
                "link",
                "code-block",
              ]}
              placeholder="Your answer..."
              style={{ minHeight: "50px" }}
            />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div
              className="ql-editor p-0 border-0"
              dangerouslySetInnerHTML={{ __html: answer.answer }}
            />
            <StarRating
              isOwnAnswer={user?.userid === answer.userid}
              answerId={answer.answerid}
              userRating={answer.userRating || 0}
              averageRating={answer.averageRating || 0}
              ratingCount={answer.ratingCount || 0}
              onRatingChange={onRatingChange}
            />
            <small className="text-muted">Posted by {answer.username}</small>
            <small className="text-muted d-block" style={{ fontSize: "10px" }}>
              {answer.created_at
                ? format(new Date(answer.created_at), "MMM d, yyyy, hh:mm a")
                : "Date not available"}
            </small>

            {user?.userid === answer.userid && (
              <div className="mt-2">
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(answer.answerid, "answer")}
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </article>
    );
  }
);

const Question = () => {
  const { questionid } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editContent, setEditContent] = useState({
    title: "",
    description: "",
    tags: [],
    answer: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [wordCount, setWordCount] = useState(0);
  const quillRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [qResponse, aResponse] = await Promise.all([
        baseURL.get(`/api/question/${questionid}`),
        baseURL.get(`/api/answer/${questionid}`),
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
      navigate("/auth?tab=login", { replace: true });
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, fetchData]);

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      logout();
      navigate("/auth?tab=login", { replace: true });
    } else {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  const handleUpdateQuestion = async (updatedData) => {
    try {
      setIsSubmitting(true);
      const response = await baseURL.put(`/api/content/${questionid}`, {
        type: "question",
        ...updatedData,
      });

      if (response.data.success) {
        setQuestion(response.data.question);
        setEditingQuestion(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAnswer = async (answerId, newContent) => {
    try {
      setIsSubmitting(true);
      const response = await baseURL.put(`/api/content/${answerId}`, {
        type: "answer",
        answer: newContent,
      });

      if (response.data.success) {
        setAnswers((prev) =>
          prev.map((a) =>
            a.answerid === answerId ? { ...a, answer: newContent } : a
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = useCallback(
    ({ answerId, newRating, newAverage, newCount }) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a.answerid === answerId
            ? {
                ...a,
                userRating: newRating,
                averageRating: newAverage,
                ratingCount: newCount,
              }
            : a
        )
      );
    },
    []
  );

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

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    const cleanAnswer = DOMPurify.sanitize(newAnswer);
    if (!cleanAnswer.trim() || cleanAnswer === "<p><br></p>") {
      setError("Answer cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await baseURL.post("/api/answer", {
        questionid,
        answer: cleanAnswer,
      });

      setAnswers((prev) => [...prev, response.data.answer]);
      setNewAnswer("");
      setError("");
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingQuestion = () => {
    setEditingQuestion(true);
    setEditContent({
      title: question.title,
      description: question.description,
      tags: question.tags || [],
    });
  };

  const submitEditedQuestion = async (e) => {
    e.preventDefault();
    if (!editContent.title.trim() || !editContent.description.trim()) {
      setError("Title and description are required");
      return;
    }

    await handleUpdateQuestion({
      title: editContent.title.trim(),
      description: editContent.description.trim(),
      tags: editContent.tags || [],
    });
  };

  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mt-4 alert alert-danger">
        {error || "Question not found"}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-4">
        ← Back to Questions
      </Link>

      {/* Question Display/Edit Section */}
      <article className="card mb-4">
        <div className="card-body">
          {editingQuestion ? (
            <form onSubmit={submitEditedQuestion}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={editContent.title}
                  onChange={(e) =>
                    setEditContent({ ...editContent, title: e.target.value })
                  }
                  placeholder="Question Title"
                  required
                />
              </div>
              <div className="mb-3">
                <CustomToolbar editorRef={quillRef} />
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editContent.description}
                  onChange={(value) =>
                    setEditContent({ ...editContent, description: value })
                  }
                  modules={{
                    toolbar: { container: "#toolbar" },
                    clipboard: { matchVisual: false },
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "list",
                    "bullet",
                    "link",
                    "code-block",
                  ]}
                  placeholder="Question details..."
                  style={{ minHeight: "50px" }}
                />
              </div>
              <div className="mb-3">
                <TagInput
                  initialTags={editContent.tags}
                  onTagsChange={(tags) =>
                    setEditContent({ ...editContent, tags })
                  }
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setEditingQuestion(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
          ) : (
            <>
              <h4 className="card-title">{question.title}</h4>
              <div
                className="ql-editor p-0 border-0"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />
              <div className="d-flex flex-wrap gap-1 mt-2">
                {question.tags?.map((tag) => (
                  <span key={tag} className="badge bg-primary">
                    {tag}
                  </span>
                ))}
              </div>
              <footer className="text-muted mt-2">
                Posted by {question.username}
              </footer>
              <small className="text-muted" style={{ fontSize: "10px" }}>
                {question.created_at
                  ? format(
                      new Date(question.created_at),
                      "MMM d, yyyy, hh:mm a"
                    )
                  : "Date not available"}
              </small>

              {user?.userid === question.userid && (
                <div className="mt-3">
                  <button
                    className="btn btn-warning me-2"
                    onClick={startEditingQuestion}
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
            </>
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
          <div className="list-group gap-3">
            {answers.map((answer) => (
              <AnswerItem
                key={answer.answerid}
                answer={answer}
                onEdit={handleUpdateAnswer}
                onDelete={handleDelete}
                onRatingChange={handleRatingChange}
                user={user}
                editorRef={quillRef}
              />
            ))}
          </div>
        )}
      </section>

      {/* New Answer Section */}
      <section className="card mb-4 mt-4">
        <div className="card-body">
          <h5 className="card-title">Post Your Answer</h5>
          <form onSubmit={handleAnswerSubmit}>
            <CustomToolbar editorRef={quillRef} />
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={newAnswer}
              onChange={(value, delta, source, editor) => {
                setNewAnswer(value);
                setWordCount(editor.getText().trim().split(/\s+/).length);
              }}
              modules={{
                toolbar: { container: "#toolbar" },
                clipboard: { matchVisual: false },
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "list",
                "bullet",
                "link",
                "code-block",
              ]}
              placeholder="Write your answer here..."
              style={{ minHeight: "150px" }}
            />
            <div className="d-flex justify-content-between mt-2">
              <small className="text-muted">
                Word count: {wordCount}
                {wordCount > 500 && " | Consider being more concise"}
              </small>
              {newAnswer && newAnswer !== "<p><br></p>" && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    if (window.confirm("Discard this answer?")) {
                      setNewAnswer("");
                    }
                  }}
                >
                  Discard
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={
                isSubmitting || !newAnswer.trim() || newAnswer === "<p><br></p>"
              }
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Question;
