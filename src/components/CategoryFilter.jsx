/**
 * CategoryFilter component for filtering questions by category
 */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { baseURL } from "../utils/api";
// import "./../../index.css";

/**
 * @param {Object} props
 * @param {Function} props.onCategoryChange - Callback when category changes
 */
const CategoryFilter = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await baseURL.get("/api/category");
        setCategories(response.data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Handle category selection
  const handleChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="">
      <select
        className="form-select"
        style={{ minWidth: "200px" }}
        value={selectedCategory}
        onChange={handleChange}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

CategoryFilter.propTypes = {
  onCategoryChange: PropTypes.func.isRequired,
};

export default CategoryFilter;
