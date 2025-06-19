/**
 * Home page (Questions Page) for Evangadi Forum
 * Production Summary: Displays a welcome message, list of question titles with usernames,
 * pagination, category filter, and search functionality.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { baseURL } from "../utils/api";
import { format } from "date-fns";
import Pagination from "../components/Pagination";
import CategoryFilter from "../components/CategoryFilter";
import "bootstrap/dist/css/bootstrap.min.css";
// import "./../../index.css";

/**
 * Fetches and displays all questions with pagination, category filter, and search
 * Redirects unauthenticated users
 * @returns {JSX.Element} Home page
 */
const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [userD, setUser] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Fetch questions with pagination, search, and category
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?tab=login");
      return;
    }

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          category,
        });
        const [questionsResponse, userResponse] = await Promise.all([
          baseURL.get(`/api/question?${params.toString()}`),
          baseURL.get("/api/auth/checkUser"),
        ]);
        const { questions, totalPages: fetchedTotalPages } =
          questionsResponse.data;
        setQuestions(
          questions.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        );
        setTotalPages(fetchedTotalPages);
        setUser(userResponse.dataValues);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/auth?tab=login");
        } else {
          setError("Failed to load questions or user data");
        }
      }
    };
    fetchData();
  }, [isAuthenticated, navigate, logout, currentPage, searchQuery, category]);
  console.log(user);
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1); // Reset to first page on category change
  };
  // console.log(user);

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-11 col-lg-9">
          {isAuthenticated && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Link to="/ask" className="home-ask-btn">
                Ask Question
              </Link>
              <h4 className="mb-0">Welcome, <span style={{color:"green", fontWeight:"bold"}}>{user?.firstname}!</span></h4>
            </div>
          )}

          {/* Search and Category Filter */}
          <div className="d-flex gap-3 mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <CategoryFilter onCategoryChange={handleCategoryChange} />
          </div>

          <div className="d-flex flex-column gap-3">
            <div className="card">
              <div className="card-header bg-white">
                <h2 className="mb-0">Questions</h2>
              </div>
              <div className="card-body p-0">
                {error && <div className="alert alert-danger m-3">{error}</div>}
                {questions.length === 0 && !error && (
                  <div className="alert alert-info m-3">
                    No questions found.
                  </div>
                )}
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
                              style={{ fontSize: "10px" }}
                            >
                              {format(
                                new Date(q.created_at),
                                "MMM d, yyyy, hh:mm a"
                              )}
                            </small>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {q.tags?.map((tag) => (
                                <span key={tag} className="badge bg-primary">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-muted">›</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
