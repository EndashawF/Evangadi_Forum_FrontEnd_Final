import { useState } from "react";
import PropTypes from "prop-types";
import { baseURL } from "../utils/api";
import { useAuth } from "../utils/auth";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({
  answerId,
  userRating,
  averageRating,
  ratingCount,
  onRatingChange,
  isOwnAnswer = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      setError("Please log in to rate answers.");
      return;
    }

    if (isOwnAnswer) {
      setError("You cannot rate your own answer.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const newRating = userRating === rating ? 0 : rating;

      const response = await baseURL.post("/api/rating", {
        answerId, // Send answerId to match backend expectation
        rating: newRating,
      });

      if (response.data.success) {
        const { averageRating: newAverage, ratingCount: newCount } =
          response.data.data; // Access nested data

        if (onRatingChange) {
          onRatingChange({
            answerId,
            newRating,
            newAverage,
            newCount,
          });
        }
      } else {
        setError(response.data.error || "Failed to submit rating.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [...Array(10)].map((_, index) => {
      const ratingValue = (index + 1) / 2;
      const isActive = ratingValue <= (hoverRating || userRating);
      const isHalfStar = ratingValue % 1 !== 0;

      return (
        <button
          key={index}
          className={`btn p-0 border-0 bg-transparent ${
            isSubmitting ? "opacity-50 disabled" : ""
          }`}
          onMouseEnter={() => !isSubmitting && setHoverRating(ratingValue)}
          onMouseLeave={() => !isSubmitting && setHoverRating(0)}
          onClick={() => !isSubmitting && handleRating(ratingValue)}
          disabled={isSubmitting}
          aria-label={`Rate ${ratingValue} out of 5`}
          aria-pressed={isActive}
          style={{
            lineHeight: 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isActive ? (
            isHalfStar ? (
              <FaStarHalfAlt className="text-warning" size={18} />
            ) : (
              <FaStar className="text-warning" size={18} />
            )
          ) : (
            <FaRegStar
              className="text-warning opacity-50 hover-opacity-75"
              size={18}
            />
          )}
        </button>
      );
    });
  };

  return (
    <div className="star-rating-container">
      {/* Star Rating Interaction */}
      {isAuthenticated && !isOwnAnswer && (
        <div
          className="d-flex align-items-center"
          style={{ gap: "2px" }}
          aria-label="Rate this answer"
        >
          {renderStars()}
          {isSubmitting && (
            <span className="ms-2 small text-muted fst-italic">Saving...</span>
          )}
        </div>
      )}

      {/* Rating Summary */}
      <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
        {averageRating > 0 ? (
          <>
            <div className="d-flex align-items-center">
              <span className="fw-semibold text-warning">
                {averageRating.toFixed(1)}
              </span>
              <span className="mx-1 text-muted fw-semibold">/</span>
              <span className="text-muted fw-semibold">5</span>
            </div>
            <span className="text-muted small fw-semibold">
              ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
            </span>
          </>
        ) : (
          <span className="text-muted small">No ratings yet</span>
        )}

        {/* User Rating Acknowledgement */}
        {userRating > 0 && !isOwnAnswer && (
          <span className="small text-info ms-2">
            (Your rating: <strong>{userRating.toFixed(1)}</strong>)
          </span>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <div
          className={`small fst-italic mt-1 ${
            isOwnAnswer ? "text-danger" : "text-warning"
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
};

StarRating.propTypes = {
  answerId: PropTypes.number.isRequired,
  userRating: PropTypes.number.isRequired,
  averageRating: PropTypes.number.isRequired,
  ratingCount: PropTypes.number.isRequired,
  onRatingChange: PropTypes.func.isRequired,
  isOwnAnswer: PropTypes.bool,
};

StarRating.defaultProps = {
  isOwnAnswer: false,
};

export default StarRating;
