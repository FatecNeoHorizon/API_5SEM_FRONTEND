import React from "react";
import PropTypes from "prop-types";

export default function DevTooltip({ active, payload })
{

    DevTooltip.propTypes = {
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
    const nome = row.dev || "Dev";
    const horas = row.horas ?? "-";
    const dias = row.diasTrabalhados ?? undefined;
    const atividades = Array.isArray(row.atividades) ? row.atividades.slice(0, 2).join(", ") : undefined;
    return (
      <div className="bg-white border rounded p-2 shadow-sm small">
        <div className="fw-semibold">{nome}</div>
        <div>Horas: {horas}h{typeof dias === "number" ? ` • ${dias} dias` : ""}</div>
        {atividades ? <div>Atividades: {atividades}</div> : null}
      </div>
    );
}