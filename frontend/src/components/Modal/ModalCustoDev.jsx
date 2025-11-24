import React from "react";
import { listDevs, updateDev, listFatos, updateFato } from "../../services/metrics/modal.service";
import Hint from "../Hint/Hint";

const EX_IDS = new Set([1]);
const EX_NAMES = new Set(["Não atribuido", "Nao atribuido", "Não Atribuido", "Nao Atribuido"]);
const filtraNaoAtribuido = (arr) =>
  Array.isArray(arr)
    ? arr.filter((d) => !EX_IDS.has(Number(d.id)) && !EX_NAMES.has(String(d.nome ?? "").trim()))
    : arr;

export default function ModalCustoDev({ show, onClose, onSaveSuccess }) {
  const [rows, setRows] = React.useState([]);
  const [snapshot, setSnapshot] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [alert, setAlert] = React.useState({ type: "", msg: "" });

  React.useEffect(() => {
    if (!show) return;
    (async () => {
      setLoading(true);
      setAlert({ type: "", msg: "" });
      try {
        const devs = await listDevs();
        const normalized = (devs || []).map((d) => ({
          id: d.id,
          nome: d.nome ?? "",
          custoHora: Number(d.custoHora ?? 0),
        }));
        const filtrados = filtraNaoAtribuido(normalized);
        setRows(filtrados);
        setSnapshot(filtrados.map((d) => ({ ...d })));
      } catch {
        setAlert({ type: "danger", msg: "Falha ao carregar desenvolvedores." });
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  function onChangeCost(id, value) {
    const v = value === "" ? "" : Number(value);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, custoHora: v } : r)));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!window.confirm("Confirmar salvamento e recálculo dos custos?")) return;

    const changed = rows.filter((r) => {
      const prev = snapshot.find((s) => s.id === r.id);
      return prev && Number(prev.custoHora) !== Number(r.custoHora);
    });

    if (changed.length === 0) {
      setAlert({ type: "info", msg: "Nenhuma alteração detectada." });
      return;
    }

    setSaving(true);
    setAlert({ type: "", msg: "" });

    try {
      await Promise.all(
        changed.map((d) =>
          updateDev({ id: d.id, nome: d.nome, custoHora: Number(d.custoHora) })
        )
      );

      const fatos = await listFatos();
      const alteredIds = new Set(changed.map((d) => d.id));
      const custoHoraMap = new Map(changed.map((d) => [d.id, Number(d.custoHora)]));

      const toUpdate = (fatos || []).filter(
        (f) => f?.dimDev?.id && alteredIds.has(Number(f.dimDev.id))
      );

      const payloads = toUpdate.map((f) => {
        const horas = Number(f.horasQuantidade ?? f.horas ?? 0);
        const novoCustoHora = custoHoraMap.get(Number(f.dimDev.id)) ?? 0;
        const novoCusto = Number(novoCustoHora) * horas;

        return {
          ...f,
          custo: novoCusto,
          dimDev: { id: f.dimDev.id, ...(f.dimDev.nome ? { nome: f.dimDev.nome } : {}) },
          ...(f.dimProjeto?.id ? { dimProjeto: { id: f.dimProjeto.id } } : {}),
          ...(f.dimPeriodo?.id ? { dimPeriodo: { id: f.dimPeriodo.id } } : {}),
        };
      });

      await Promise.all(payloads.map((f) => updateFato(f)));

      setAlert({ type: "success", msg: "Custos atualizados com sucesso!" });
      setSnapshot(rows.map((d) => ({ ...d })));
      if (typeof onSaveSuccess === "function") onSaveSuccess();
      if (typeof onClose === "function") onClose();
      setTimeout(() => window.location.reload(), 300);
    } catch {
      setAlert({
        type: "danger",
        msg: "Falha ao salvar alterações. Verifique as rotas e tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  const modalClass = `modal fade ${show ? "show d-block" : ""}`;
  const backdrop = show ? <div className="modal-backdrop fade show"></div> : null;

  return (
    <>
      <div className={modalClass} tabIndex="-1" role="dialog" aria-modal={show ? "true" : "false"}>
        <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center gap-2">
                <h5 className="modal-title">Custo por Hora — Desenvolvedores</h5>
                <Hint 
                  text="Configure o custo por hora de cada desenvolvedor. Ao salvar, todos os custos históricos serão recalculados automaticamente com base nos novos valores."
                  position="bottom"
                  size="sm"
                />
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="modal-body" style={{ height: "70vh", overflowY: "auto" }}>
                {alert.msg && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

                {loading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                    <div className="spinner-border" role="status" />
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th style={{ width: "60%" }}>Desenvolvedor</th>
                          <th style={{ width: "40%" }}>
                            <div className="d-flex align-items-center gap-2">
                              <span>Custo por hora (R$)</span>
                              <Hint 
                                text="Valor em reais cobrado por hora de trabalho. Este valor será multiplicado pelas horas trabalhadas para calcular o custo total."
                                position="left"
                                size="sm"
                              />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((dev) => (
                          <tr key={dev.id}>
                            <td>{dev.nome}</td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control"
                                value={dev.custoHora}
                                onChange={(e) => onChangeCost(dev.id, e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || loading}>
                  {saving ? "Salvando..." : "Salvar"}
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
