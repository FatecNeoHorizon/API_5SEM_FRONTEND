import React from "react";

/**
 * Modal de custo/hora dos desenvolvedores (dados mokados)
 * - Duas colunas: Desenvolvedor | Custo por hora (R$)
 * - Scroll vertical no body
 * - Confirmação antes de salvar
 * - Mantém estética Bootstrap e sobrepõe a tela sem sair da página
 */

const MOCK_DEVS = [
  { id: 1, name: "Ana Ribeiro", hourlyCost: 120.0 },
  { id: 2, name: "Bruno Costa", hourlyCost: 95.5 },
  { id: 3, name: "Carla Nunes", hourlyCost: 110.0 },
  { id: 4, name: "Diego Martins", hourlyCost: 87.0 },
  { id: 5, name: "Eduarda Lima", hourlyCost: 102.4 },
  { id: 6, name: "Fernando Alves", hourlyCost: 140.0 },
  { id: 7, name: "Gabriela Souza", hourlyCost: 98.0 },
  { id: 8, name: "Henrique Lopes", hourlyCost: 115.0 },
  { id: 9, name: "Isabela Rocha", hourlyCost: 99.9 },
  { id: 10, name: "João Pedro", hourlyCost: 105.0 },
  { id: 11, name: "Karen Dias", hourlyCost: 125.0 },
  { id: 12, name: "Lucas Ferreira", hourlyCost: 92.0 },
];

export default function ModalCustoDev({ show, onClose, onSaveSuccess }) {
  const [rows, setRows] = React.useState(MOCK_DEVS);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState({ type: "", message: "" });

  // reabre com dados mokados sempre que show = true
  React.useEffect(() => {
    if (show) {
      setRows(MOCK_DEVS.map((d) => ({ ...d })));
      setSaving(false);
      setFeedback({ type: "", message: "" });
    }
  }, [show]);

  function handleChange(id, value) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hourlyCost: value } : r))
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    // confirmação
    const ok = window.confirm("Confirmar salvamento dos custos por hora?");
    if (!ok) return;

    try {
      setSaving(true);
      // Aqui futuramente chamar API para persistir:
      // await api.saveMany(rows)
      await new Promise((res) => setTimeout(res, 600)); // simula latência

      setFeedback({ type: "success", message: "Custos atualizados com sucesso!" });
      if (typeof onSaveSuccess === "function") onSaveSuccess();
    } catch (err) {
      setFeedback({
        type: "danger",
        message: "Falha ao salvar. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  // classes para mostrar/ocultar como modal bootstrap (sem react-bootstrap)
  const modalClass = `modal fade ${show ? "show d-block" : ""}`;
  const backdrop = show ? <div className="modal-backdrop fade show"></div> : null;

  return (
    <>
      <div className={modalClass} tabIndex="-1" role="dialog" aria-modal={show ? "true" : "false"}>
        <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Custo por Hora — Desenvolvedores</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <form onSubmit={handleSave} noValidate>
              <div
                className="modal-body"
                style={{
                  // ocupa boa parte da viewport mantendo a “página”
                  height: "70vh",
                  overflowY: "auto",
                }}
              >
                {/* feedback */}
                {feedback.message && (
                  <div className={`alert alert-${feedback.type} mb-3`} role="alert">
                    {feedback.message}
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ width: "60%" }}>Desenvolvedor</th>
                        <th style={{ width: "40%" }}>Custo por hora (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((dev) => (
                        <tr key={dev.id}>
                          <td>{dev.name}</td>
                          <td>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              className="form-control"
                              value={dev.hourlyCost}
                              onChange={(e) => handleChange(dev.id, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {backdrop}
    </>
  );
}
