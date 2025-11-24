import React from "react";
import PropTypes from "prop-types";

export default function StackedBarTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  // Filtra apenas os itens com valor > 0
  const validItems = payload.filter(item => item.value > 0);

  if (validItems.length === 0) return null;

  const dia = label || payload[0]?.payload?.date || "Dia";

  return (
    <div className="bg-white border rounded p-2 shadow-sm small">
      <div className="fw-semibold mb-2">{dia}</div>
      {validItems.map((item, idx) => (
        <div key={idx} style={{ color: item.color, marginBottom: idx < validItems.length - 1 ? "4px" : "0" }}>
          <strong>{item.name}</strong>: {typeof item.value === "number" ? item.value.toFixed(2) : item.value}h
        </div>
      ))}
    </div>
  );
}

StackedBarTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      name: PropTypes.string,
      color: PropTypes.string,
      payload: PropTypes.object,
    })
  ),
  label: PropTypes.string,
};
