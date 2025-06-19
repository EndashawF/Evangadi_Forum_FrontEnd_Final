/**
 * TagInput component for selecting and adding tags
 */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { baseURL } from "../utils/api";

const TagInput = ({ initialTags, onTagsChange }) => {
  const [tags, setTags] = useState(initialTags || []);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    console.log("TagInput: Initial tags:", initialTags);
    setTags(initialTags || []);
    const fetchTags = async () => {
      try {
        const response = await baseURL.get("/api/tag");
        console.log("TagInput: Fetched suggestions:", response.data.tags);
        setSuggestions(response.data.tags.map((tag) => tag.name));
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, [initialTags]);

  const handleAddTag = (tag) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      const trimmedTag = tag.trim();
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      onTagsChange(newTags);
      setInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    onTagsChange(newTags);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(input.trim());
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  return (
    <div className="mb-3">
      <label className="form-label">Tags</label>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="badge bg-primary d-flex align-items-center gap-1"
          >
            {tag}
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => handleRemoveTag(tag)}
            ></button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="form-control"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Add tags (press Enter or comma)"
      />
      {input && filteredSuggestions.length > 0 && (
        <ul className="list-group mt-2">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <li
              key={suggestion}
              className="list-group-item list-group-item-action"
              onClick={() => handleAddTag(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

TagInput.propTypes = {
  initialTags: PropTypes.arrayOf(PropTypes.string),
  onTagsChange: PropTypes.func.isRequired,
};

export default TagInput;
