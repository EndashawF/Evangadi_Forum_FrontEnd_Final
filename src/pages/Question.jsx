// File: src/components/Question.js
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { baseURL } from "../utils/api";
import { useAuth } from "../utils/auth";
import { format } from "date-fns";
import StarRating from "../components/StarRating";
import TagInput from "../components/TagInput";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import Delta from "quill-delta";
import debounce from "lodash.debounce";
import Pagination from "../components/Pagination"; // Import Pagination component

// Custom Code Block for Quill Editor
const CodeBlock = Quill.import("formats/code-block");
class CustomCodeBlock extends CodeBlock {
  // Create a code block node
  static create(value) {
    const node = super.create();
    node.innerHTML = value || "";
    return node;
  }

  // Get value of code block
  static value(domNode) {
    return domNode.innerHTML;
  }
}
CustomCodeBlock.blotName = "code-block";
CustomCodeBlock.tagName = "pre";
CustomCodeBlock.className = "ql-syntax";

// Custom Link format to ensure URLs have proper protocol
const CustomLink = Quill.import("formats/link");
class SafeLink extends CustomLink {
  // Sanitize URLs to include protocol
  static sanitize(url) {
    const sanitized = super.sanitize(url);
    if (sanitized && !sanitized.startsWith("http")) {
      return `https://${sanitized}`;
    }
    return sanitized;
  }
}

// Register custom formats with Quill
Quill.register(CustomCodeBlock, true);
Quill.register(SafeLink, true);

// CustomToolbar Component
const CustomToolbar = ({ editorRef }) => {
  // Define color options for text and background
  const colorOptions = useMemo(
    () => [
      "#000000",
      "#e60000",
      "#ff9900",
      "#ffff00",
      "#008a00",
      "#0066cc",
      "#9933ff",
      "#ffffff",
      "#facccc",
      "#ffebcc",
      "#ffffcc",
      "#cce8cc",
      "#cce0f5",
      "#ebd6ff",
      "#bbbbbb",
      "#f06666",
      "#ffc266",
      "#ffff66",
      "#66b966",
      "#66a3e0",
      "#c285ff",
      "#888888",
      "#a10000",
      "#b26b00",
      "#b2b200",
      "#006100",
      "#0047b2",
      "#6b24b2",
      "#444444",
      "#5c0000",
      "#663d00",
      "#666600",
      "#003700",
      "#002966",
      "#3d1466",
    ],
    []
  );

  // Handler to insert code block
  const insertCodeBlock = useCallback(() => {
    const editor = editorRef.current?.getEditor();
    const range = editor?.getSelection();
    if (range) {
      const code = prompt("Enter your code:");
      if (code) {
        editor.insertText(range.index, "\n");
        editor.insertEmbed(range.index, "code-block", code);
        editor.insertText(range.index + 1, "\n");
      }
    }
  }, [editorRef]);

  return (
    <div id="toolbar" className="border-b border-gray-200">
      {/* Text structure controls */}
      <span className="ql-formats">
        <select
          className="ql-header"
          title="Heading"
          aria-label="Heading level"
        >
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option selected>Normal</option>
        </select>
        <button
          className="ql-blockquote"
          title="Blockquote"
          aria-label="Blockquote"
        ></button>
      </span>

      {/* Text formatting controls */}
      <span className="ql-formats">
        <button className="ql-bold" title="Bold" aria-label="Bold"></button>
        <button
          className="ql-italic"
          title="Italic"
          aria-label="Italic"
        ></button>
        <button
          className="ql-underline"
          title="Underline"
          aria-label="Underline"
        ></button>
        <button
          className="ql-strike"
          title="Strikethrough"
          aria-label="Strikethrough"
        ></button>
      </span>

      {/* List and code controls */}
      <span className="ql-formats">
        <button
          className="ql-list"
          value="ordered"
          title="Ordered List"
          aria-label="Ordered list"
        ></button>
        <button
          className="ql-list"
          value="bullet"
          title="Bullet List"
          aria-label="Bullet list"
        ></button>
        <button
          className="ql-code-block"
          onClick={insertCodeBlock}
          title="Code Block"
          aria-label="Insert code block"
        >
          <svg viewBox="0 0 18 18">
            <polygon points="6,12 4,10 7.5,6.5 4,3 6,1 11,6.5"></polygon>
            <polygon points="12,12 14,10 10.5,6.5 14,3 12,1 7,6.5"></polygon>
          </svg>
        </button>
      </span>

      {/* Color controls */}
      <span className="ql-formats">
        <select className="ql-color" title="Text Color" aria-label="Text color">
          <option value="default"></option>
          {colorOptions.map((color) => (
            <option key={color} value={color}></option>
          ))}
        </select>
        <select
          className="ql-background"
          title="Background Color"
          aria-label="Background color"
        >
          <option value="default"></option>
          {colorOptions.map((color) => (
            <option key={color} value={color}></option>
          ))}
        </select>
      </span>

      {/* Media controls */}
      <span className="ql-formats">
        <button
          className="ql-link"
          title="Link"
          aria-label="Insert link"
        ></button>
      </span>

      {/* Miscellaneous controls */}
      <span className="ql-formats">
        <button
          className="ql-clean"
          title="Clear Formatting"
          aria-label="Clear formatting"
        ></button>
      </span>
    </div>
  );
};

// AnswerItem Component
const AnswerItem = React.memo(
  ({ answer, onEdit, onDelete, user, onRatingChange, editorRef }) => {
    // State for editing mode
    const [editing, setEditing] = useState(false);
    // State for edited answer content
    const [editContent, setEditContent] = useState(answer.answer);
    // State for word count in editor
    const [wordCount, setWordCount] = useState(0);

    // Handle submission of edited answer
    const handleSubmitEdit = async (e) => {
      e.preventDefault();
      // Sanitize edited content
      const cleanAnswer = DOMPurify.sanitize(editContent);

      // Validate content is not empty
      if (!cleanAnswer.trim() || cleanAnswer === "<p><br></p>") {
        return;
      }

      try {
        // Call edit handler
        await onEdit(answer.answerid, cleanAnswer);
        // Exit editing mode
        setEditing(false);
      } catch (error) {
        // Log error
        console.error("Failed to update answer:", error);
      }
    };

    // Update word count on content change
    const handleContentChange = (value, delta, source, editor) => {
      setEditContent(value);
      const text = editor.getText().trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
    };

    return (
      <article className="list-group-item">
        {editing ? (
          <form onSubmit={handleSubmitEdit}>
            {/* Render toolbar for editing */}
            <CustomToolbar editorRef={editorRef} />
            {/* Rich text editor for editing answer */}
            <ReactQuill
              ref={editorRef}
              theme="snow"
              value={editContent}
              onChange={handleContentChange}
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
                "color",
                "background",
                "image",
                "blockquote",
              ]}
              placeholder="Your answer..."
              style={{ minHeight: "50px" }}
            />
            <div className="d-flex justify-content-between align-items-center mt-2">
              {/* Display word count */}
              <small className="text-muted">Word count: {wordCount}</small>
              <div className="d-flex justify-content-end gap-2">
                {/* Cancel editing button */}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                {/* Save changes button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !editContent.trim() || editContent === "<p><br></p>"
                  }
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* Display answer content */}
            <div
              className="ql-editor p-0 border-0"
              dangerouslySetInnerHTML={{ __html: answer.answer }}
            />
            {/* Star rating component */}
            <StarRating
              isOwnAnswer={user?.userid === answer.userid}
              answerId={answer.answerid}
              userRating={answer.userRating || 0}
              averageRating={answer.averageRating || 0}
              ratingCount={answer.ratingCount || 0}
              onRatingChange={onRatingChange}
            />
            {/* Display author */}
            <small className="text-muted">Posted by {answer.username}</small>
            {/* Display creation date */}
            <small className="text-muted d-block" style={{ fontSize: "10px" }}>
              {answer.created_at
                ? format(new Date(answer.created_at), "MMM d, yyyy, hh:mm a")
                : "Date not available"}
            </small>

            {/* Edit and delete buttons for answer owner */}
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

// AnswerForm Component
const AnswerForm = ({
  onSubmit,
  content,
  onChange,
  error,
  isSubmitting,
  editorRef,
}) => {
  // State for word count
  const [wordCount, setWordCount] = useState(0);
  // Maximum allowed words
  const MAX_WORDS = 2000;

  // Handle content changes and update word count
  const handleChange = (value, delta, source, editor) => {
    onChange(value);
    const text = editor.getText().trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  };

  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    // Sanitize answer content
    const cleanAnswer = DOMPurify.sanitize(content);

    // Validate content is not empty
    if (!cleanAnswer.trim() || cleanAnswer === "<p><br></p>") {
      onChange("");
      setError("Answer cannot be empty");
      return;
    }

    // Validate word count
    if (wordCount > MAX_WORDS) {
      setError(`Answer is too long. Maximum ${MAX_WORDS} words allowed.`);
      return;
    }

    // Call submit handler
    onSubmit(e);
  };

  return (
    <section className="card">
      <div className="card-body">
        <h5 className="card-title">Post Your Answer</h5>
        <form onSubmit={handleSubmit}>
          {/* Render toolbar */}
          <CustomToolbar editorRef={editorRef} />
          {/* Rich text editor for new answer */}
          <ReactQuill
            ref={editorRef}
            theme="snow"
            value={content}
            onChange={handleChange}
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
              "color",
              "background",
              "image",
              "blockquote",
            ]}
            placeholder="Write your answer here..."
            style={{ minHeight: "50px" }}
            aria-label="Answer editor"
          />
          <div className="d-flex justify-content-center mx-auto mt-2 gap-5">
            {/* Display word count with warning if approaching limit */}
            {/* <small
              className={`text-muted ${wordCount > MAX_WORDS ? "text-danger" : ""}`}
            >
              Word count: {wordCount} / {MAX_WORDS}
              {wordCount > MAX_WORDS * 0.8 && " | Consider being more concise"}
            </small> */}
            {/* Discard button */}
            {/* {content && content !== "<p><br></p>" && ( */}

            {/* Display error message */}
            {/* {error && <div className="alert alert-danger mt-1">{error}</div>} */}
            {/* Submit button */}
            <button
              type="submit"
              className="btn btn-success btn-sm"
              disabled={
                isSubmitting ||
                !content.trim() ||
                content === "<p><br></p>" ||
                wordCount > MAX_WORDS
              }
              aria-label="Post answer"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                if (window.confirm("Discard this answer?")) {
                  onChange("");
                  setWordCount(0);
                }
              }}
              aria-label="Discard answer"
            >
              Discard
            </button>
            {/* )} */}
          </div>
        </form>
      </div>
    </section>
  );
};

// Main Question Component
const Question = () => {
  // Extract question ID from URL parameters
  const { questionid } = useParams();
  // State for question data
  const [question, setQuestion] = useState(null);
  // State for answers data
  const [answers, setAnswers] = useState([]);
  // State for new answer content
  const [newAnswer, setNewAnswer] = useState("");
  // State for editing question
  const [editingQuestion, setEditingQuestion] = useState(false);
  // State for edited question content
  const [editContent, setEditContent] = useState({
    title: "",
    description: "",
    tags: [],
  });
  // State for error messages
  const [error, setError] = useState("");
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for submitting status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for current page
  const [currentPage, setCurrentPage] = useState(1);
  // State for total pages
  const [totalPages, setTotalPages] = useState(1);
  // State for total answers
  const [totalAnswers, setTotalAnswers] = useState(0);
  // Authentication hooks
  const { isAuthenticated, logout, user } = useAuth();
  // Navigation hook
  const navigate = useNavigate();
  // Reference for Quill editor
  const quillRef = useRef(null);

  // Fetch question and paginated answers
  const fetchData = useCallback(async () => {
    try {
      // Set loading state
      setIsLoading(true);
      // Fetch question and answers concurrently
      const [qResponse, aResponse] = await Promise.all([
        baseURL.get(`/api/question/${questionid}`),
        baseURL.get(`/api/answer/${questionid}`, {
          params: { page: currentPage, limit: 5 }, // Include pagination parameters
        }),
      ]);

      // Update question state
      setQuestion(qResponse.data);
      // Update answers state
      setAnswers(aResponse.data.answers || []);
      // Update pagination metadata
      setTotalPages(aResponse.data.pagination.totalPages || 1);
      setTotalAnswers(aResponse.data.pagination.totalAnswers || 0);
    } catch (err) {
      // Handle API errors
      handleApiError(err);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  }, [questionid, currentPage]); // Depend on currentPage

  // Check authentication and fetch data on mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/auth?tab=login", { replace: true });
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, fetchData]);

  // Handle API errors
  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      // Handle unauthorized access
      logout();
      navigate("/auth?tab=login", { replace: true });
    } else {
      // Set error message
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  // Update question handler
  const handleUpdateQuestion = async (updatedData) => {
    try {
      // Set submitting state
      setIsSubmitting(true);
      // Send update request
      const response = await baseURL.put(`/api/content/${questionid}`, {
        type: "question",
        ...updatedData,
      });

      if (response.data.success) {
        // Update question state
        setQuestion(response.data.question);
        // Exit editing mode
        setEditingQuestion(false);
      }
    } catch (err) {
      // Set error message
      setError(err.response?.data?.error || "Update failed");
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Update answer handler
  const handleUpdateAnswer = async (answerId, newContent) => {
    try {
      // Set submitting state
      setIsSubmitting(true);
      // Send update request
      const response = await baseURL.put(`/api/content/${answerId}`, {
        type: "answer",
        answer: newContent,
      });

      if (response.data.success) {
        // Update answers state
        setAnswers((prev) =>
          prev.map((a) =>
            a.answerid === answerId ? { ...a, answer: newContent } : a
          )
        );
      }
    } catch (err) {
      // Set error message
      setError(err.response?.data?.error || "Update failed");
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Handle rating changes
  const handleRatingChange = useCallback(
    ({ answerId, newRating, newAverage, newCount }) => {
      // Update answers with new rating data
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

  // Handle content deletion
  const handleDelete = async (id, type) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      // Set submitting state
      setIsSubmitting(true);
      // Send delete request
      await baseURL.delete(`/api/content/${id}`, { params: { type } });

      if (type === "question") {
        // Navigate to home on question deletion
        navigate("/");
      } else {
        // Remove answer from state
        setAnswers((prev) => prev.filter((a) => a.answerid !== id));
        // Update total answers and pages
        const newTotalAnswers = totalAnswers - 1;
        setTotalAnswers(newTotalAnswers);
        setTotalPages(Math.ceil(newTotalAnswers / 5));
        // Adjust current page if necessary
        if (answers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (err) {
      // Handle API errors
      handleApiError(err);
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Submit new answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    // Sanitize answer content
    const cleanAnswer = DOMPurify.sanitize(newAnswer);
    // Validate content
    if (!cleanAnswer.trim() || cleanAnswer === "<p><br></p>") {
      setError("Answer cannot be empty");
      return;
    }

    try {
      // Set submitting state
      setIsSubmitting(true);
      // Send create answer request
      const response = await baseURL.post("/api/answer", {
        questionid,
        answer: cleanAnswer,
      });

      // Add new answer to state
      setAnswers((prev) => [...prev, response.data.answer]);
      // Update total answers and pages
      const newTotalAnswers = totalAnswers + 1;
      setTotalAnswers(newTotalAnswers);
      setTotalPages(Math.ceil(newTotalAnswers / 5));
      // Reset answer form
      setNewAnswer("");
      setError("");
      // Optionally navigate to the last page to show the new answer
      const lastPage = Math.ceil(newTotalAnswers / 5);
      setCurrentPage(lastPage);
    } catch (err) {
      // Handle API errors
      handleApiError(err);
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Quill editor modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: "#toolbar",
        handlers: {},
      },
      clipboard: {
        matchVisual: false,
        matchers: [
          [
            "IMG",
            (node, delta) => {
              return delta.compose(
                new Delta().retain(delta.length(), {
                  image: node.getAttribute("src"),
                })
              );
            },
          ],
        ],
      },
      history: {
        delay: 1000,
        maxStack: 500,
        userOnly: true,
      },
    }),
    []
  );

  // Start editing question
  const startEditingQuestion = () => {
    // Set editing mode and initialize form
    setEditingQuestion(true);
    setEditContent({
      title: question.title,
      description: question.description,
      tags: question.tags || [],
    });
  };

  // Submit edited question
  const submitEditedQuestion = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!editContent.title.trim() || !editContent.description.trim()) {
      setError("Title and description are required");
      return;
    }

    // Update question
    await handleUpdateQuestion({
      title: editContent.title.trim(),
      description: editContent.description.trim(),
      tags: editContent.tags || [],
    });
  };

  // Handle page change for pagination
  const handlePageChange = (page) => {
    // Update current page and fetch new data
    setCurrentPage(page);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render error if question not found
  if (!question) {
    return (
      <div className="container mt-4 alert alert-danger">
        {error || "Question not found"}
      </div>
    );
  }

  return (
    <div className="container mt-1">
      {/* Back to questions link */}
      <div
        className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
        style={{
          padding: "1rem",
          backgroundColor: "#f8f9fa", // Light gray
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        }}
      >
        <Link
          to="/"
          className="btn btn-outline-primary"
          style={{
            fontWeight: "500",
            fontSize: "0.95rem",
            padding: "0.4rem 1rem",
            borderRadius: "6px",
          }}
        >
          ← Back to Questions
        </Link>

        {/* Pagination component */}
        <div style={{ minWidth: "200px" }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Question Display/Edit Section */}
      <article className="card">
        <div className="card-body">
          {editingQuestion ? (
            <form onSubmit={submitEditedQuestion}>
              {/* Question title input */}
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
                  aria-label="Question title"
                />
              </div>
              {/* Question description editor */}
              <div className="mb-3">
                <CustomToolbar editorRef={quillRef} />
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editContent.description}
                  onChange={(value) =>
                    setEditContent({ ...editContent, description: value })
                  }
                  modules={quillModules}
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
                    "color",
                    "background",
                    "image",
                    "blockquote",
                  ]}
                  placeholder="Question details..."
                  style={{ minHeight: "50px" }}
                  aria-label="Question description"
                />
              </div>
              {/* Tags input */}
              <div className="mb-3">
                <TagInput
                  initialTags={editContent.tags}
                  onTagsChange={(tags) =>
                    setEditContent({ ...editContent, tags })
                  }
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                {/* Cancel editing button */}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setEditingQuestion(false)}
                  disabled={isSubmitting}
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                {/* Save changes button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  aria-label="Save changes"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
              {/* Error message */}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
          ) : (
            <>
              {/* Display question title */}
              <h4 className="card-title">{question.title}</h4>
              {/* Display question description */}
              <div
                className="ql-editor p-0 border-0"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />
              {/* Display tags */}
              <div className="d-flex flex-wrap gap-1 mt-2">
                {question.tags?.map((tag) => (
                  <span key={tag} className="badge bg-primary">
                    {tag}
                  </span>
                ))}
              </div>
              {/* Display author */}
              <footer className="text-muted mt-2">
                Posted by {question.username}
              </footer>
              {/* Display creation date */}
              <small className="text-muted" style={{ fontSize: "10px" }}>
                {question.created_at
                  ? format(
                      new Date(question.created_at),
                      "MMM d, yyyy, hh:mm a"
                    )
                  : "Date not available"}
              </small>

              {/* Edit and delete buttons for question owner */}
              {user?.userid === question.userid && (
                <div className="mt-1">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={startEditingQuestion}
                    aria-label="Edit question"
                  >
                    Edit Question
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(questionid, "question")}
                    disabled={isSubmitting}
                    aria-label="Delete question"
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
        {/* Display total answers */}
        <h5>Answers ({totalAnswers})</h5>

        {/* Display error message */}
        {/* {error && <div className="alert alert-danger">{error}</div>} */}

        {/* Display message if no answers */}
        {answers.length === 0 ? (
          <div className="alert alert-info">
            No answers yet. Be the first to respond!
          </div>
        ) : (
          <div className="list-group gap-3">
            {/* Render paginated answers */}
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
        {/* New Answer Section */}
        <AnswerForm
          onSubmit={handleAnswerSubmit}
          content={newAnswer}
          onChange={setNewAnswer}
          error={error}
          isSubmitting={isSubmitting}
          editorRef={quillRef}
        />
      </section>
    </div>
  );
};

export default Question;
