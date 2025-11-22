import React from "react";
import PropTypes from "prop-types";
import "./Hint.css";
const Hint = ({ text, position = "top", size = "md" }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleClick = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const sizeClasses = {
    sm: "hint-icon-sm",
    md: "hint-icon-md",
    lg: "hint-icon-lg",
  };

  return (
    <span className="hint-container">
      <span
        className={`hint-icon ${sizeClasses[size]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Informação adicional"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="hint-svg"
        >
          <circle cx="12" cy="12" r="10" fill="#6c757d" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            i
          </text>
        </svg>
      </span>
      {isVisible && (
        <span className={`hint-tooltip hint-tooltip-${position}`}>
          {text}
          <span className={`hint-arrow hint-arrow-${position}`}></span>
        </span>
      )}
    </span>
  );
};

export default Hint;

Hint.propTypes = {
  text: PropTypes.string.isRequired,
  position: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

Hint.defaultProps = {
  position: "top",
  size: "md",
};
