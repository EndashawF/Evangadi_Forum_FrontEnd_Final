/**
 * Home page (Questions Page) for Evangadi Forum
 * Production Summary: Displays a welcome message, list of question titles with usernames, and an option to ask a new question.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import { baseURL } from "../utils/api";
import { format } from "date-fns";

/**
 * Fetches and displays all questions from /api/question, redirects unauthenticated users
 * @returns {JSX.Element} Home page
 */
const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [userD, setUser] = useState("");
  const [error, setError] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?tab=login");
      return;
    }

    const fetchData = async () => {
      try {
        const [questionsResponse, userResponse] = await Promise.all([
          baseURL.get("/api/question"),
          baseURL.get("/api/auth/checkUser"),
        ]);
        const sortedQuestions = questionsResponse.data.questions.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setQuestions(sortedQuestions);
        setUser(userResponse.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout(); // Clear token and reset auth state
          navigate("/auth?tab=login");
        } else {
          setError("Failed to load questions or user data");
        }
      }
    };
    fetchData();
  }, [isAuthenticated, navigate, logout]);

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-11 col-lg-9">
          {isAuthenticated && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Link to="/ask" className="home-ask-btn">
                Ask Question
              </Link>
              <h4 className="mb-0">Welcome, {user?.firstname}</h4>
            </div>
          )}

          <div className="d-flex flex-column gap-3">
            <div className="card">
              <div className="card-header bg-white">
                <h2 className="mb-0">Questions</h2>
              </div>
              <div className="card-body p-0">
                {error && <div className="alert alert-danger m-3">{error}</div>}
                <ul className="list-group list-group-flush">
                  {questions.map((q) => (
                    <li key={q.id} className="list-group-item p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            {q.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="d-flex flex-column">
                            <Link
                              to={`/question/${q.questionid}`}
                              className="text-decoration-none fw-bold"
                            >
                              {q.title}
                            </Link>
                            <small className="text-muted">
                              Posted by: {q.username}
                            </small>
                            <small
                              className="text-muted"
                              style={{ paddingLeft: "0px", fontSize: "10px" }}
                            >
                              {format(
                                new Date(q.created_at),
                                "MMM d, yyyy, hh:mm a"
                              )}
                            </small>
                          </div>
                        </div>
                        <span className="text-muted">›</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
