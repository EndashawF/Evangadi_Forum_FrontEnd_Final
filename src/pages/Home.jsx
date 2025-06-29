/**
 * Home page (Questions Page) for Evangadi Forum
 * Production Summary: Displays a welcome message, list of question titles with usernames,
 * pagination, category filter, and search functionality.
 */
import { useEffect, useState } from "react"; // Import React hooks
import { Link, useNavigate } from "react-router-dom"; // Import routing components
import { useAuth } from "../utils/auth"; // Import authentication context
import { baseURL } from "../utils/api"; // Import API base URL
import { format } from "date-fns"; // Import date formatting utility
import Pagination from "../components/Pagination"; // Import pagination component
import CategoryFilter from "../components/CategoryFilter"; // Import category filter component
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

/**
 * Fetches and displays all questions with pagination, category filter, and search
 * Redirects unauthenticated users
 * @returns {JSX.Element} Home page
 */
const Home = () => {
  // State for storing questions list
  const [questions, setQuestions] = useState([]);
  // State for storing user data
  const [userD, setUser] = useState("");
  // State for storing error messages
  const [error, setError] = useState("");
  // State for current page in pagination
  const [currentPage, setCurrentPage] = useState(1);
  // State for total number of pages
  const [totalPages, setTotalPages] = useState(1);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for selected category filter
  const [category, setCategory] = useState("");
  // Destructure auth context values
  const { isAuthenticated, user, logout } = useAuth();
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  // Constant for items per page in pagination
  const itemsPerPage = 3;

  // Effect hook to fetch questions when dependencies change
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      navigate("/auth?tab=login");
      return;
    }

    // Async function to fetch data
    const fetchData = async () => {
      try {
        // Create query parameters for API call
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          category,
        });
        // Fetch questions and user data in parallel
        const [questionsResponse, userResponse] = await Promise.all([
          baseURL.get(`/api/question?${params.toString()}`),
          baseURL.get("/api/auth/checkUser"),
        ]);
        // Destructure response data
        const { questions, totalPages: fetchedTotalPages } =
          questionsResponse.data;
        // Sort questions by date (newest first) and update state
        setQuestions(
          questions.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        );
        // Update pagination and user data
        setTotalPages(fetchedTotalPages);
        setUser(userResponse.dataValues);
      } catch (err) {
        // Handle errors
        if (err.response?.status === 401) {
          // Logout and redirect on unauthorized
          logout();
          navigate("/auth?tab=login", { replace: true });
        } else {
          // Display error message for other failures
          setError("Failed to load questions or user data");
        }
      }
    };
    fetchData();
  }, [isAuthenticated, navigate, logout, currentPage, searchQuery, category]);

  // Handler for pagination page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler for search input changes
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handler for category filter changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1); // Reset to first page on category change
  };

  return (
    // Main container
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      <div className="row justify-content-center">
        <div className="col-md-11 col-lg-9">
          {/* Welcome message and ask question button */}
          {isAuthenticated && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Link to="/ask" className="home-ask-btn">
                Ask Question
              </Link>
              <h4 className="mb-0">
                Welcome,{" "}
                <span style={{ color: "green", fontWeight: "bold" }}>
                  {user?.firstname}!
                </span>
              </h4>
            </div>
          )}

          {/* Search and Category Filter */}
          <div className="d-flex gap-3 mb-4">
            {/* Search input */}
            <input
              type="text"
              className="form-control"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {/* Category filter dropdown */}
            <CategoryFilter onCategoryChange={handleCategoryChange} />
          </div>

          {/* Questions list section */}
          <div className="d-flex flex-column gap-3">
            <div className="card">
              <div className="card-header bg-white">
                <h2 className="mb-0">Questions</h2>
              </div>
              <div className="card-body p-0">
                {/* Error message display */}
                {error && <div className="alert alert-danger m-3">{error}</div>}
                {/* Empty state message */}
                {questions.length === 0 && !error && (
                  <div className="alert alert-info m-3">
                    No questions found.
                  </div>
                )}
                {/* Questions list */}
                <ul className="list-group list-group-flush">
                  {/* Map through questions array */}
                  {questions.map((q) => (
                    <li key={q.id} className="list-group-item p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          {/* User avatar circle */}
                          <div
                            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            {q.username?.charAt(0).toUpperCase()}
                          </div>
                          {/* Question details */}
                          <div className="d-flex flex-column">
                            {/* Question title link */}
                            <Link
                              to={`/question/${q.questionid}`}
                              className="text-decoration-none fw-bold"
                            >
                              {q.title}
                            </Link>
                            {/* Username and date */}
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
                            {/* Tags display */}
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {q.tags?.map((tag) => (
                                <span key={tag} className="badge bg-primary">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Right arrow indicator */}
                        <span className="text-muted">›</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Pagination component */}
              <Pagination
                style={{
                  position: "fixed",
                  bottom: "0px", // adjust this value depending on your footer height
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000, // ensure it appears above footer/background
                  backgroundColor: "#fff", // optional: white background to prevent overlap
                  padding: "10px 20px",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                }}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
