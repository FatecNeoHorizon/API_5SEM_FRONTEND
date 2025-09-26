import React from "react";
import PropTypes from "prop-types";

export default function ProjetoTooltip({ active, payload })
{

     ProjetoTooltip.propTypes = {
        active: PropTypes.bool,
        payload: PropTypes.arrayOf(
          PropTypes.shape({
            payload: PropTypes.object,
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string,
          })
        ),
      };

    if (!active || !payload || !payload.length) return null;
    const row = payload[0]?.payload || {};
    const nome = row.task || row.projeto || "Projeto";
    const horas = row.horas ?? "-";
    return (
      <div className="bg-white border rounded p-2 shadow-sm small">
        <div className="fw-semibold">{nome}</div>
        <div>Horas: {horas}h</div>
      </div>
    );
}