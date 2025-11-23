import React, { useEffect, useState } from "react";
import { listUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../../services/metrics/modal.service";

export default function ModalUsuario({ show, onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ email: "", senha: "", cargo: "DEVELOPER" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    setAlert({ type: "", msg: "" });
    listUsuarios()
      .then(setUsuarios)
      .catch(() => setAlert({ type: "danger", msg: "Falha ao carregar usuários." }))
      .finally(() => setLoading(false));
  }, [show]);

  function openEdit(usuario) {
    setEditId(usuario.id);
    setForm({ email: usuario.email, senha: "", cargo: usuario.cargo });
    setShowForm(true);
  }

  function openCreate() {
    setEditId(null);
    setForm({ email: "", senha: "", cargo: "DEVELOPER" });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm({ email: "", senha: "", cargo: "DEVELOPER" });
    setEditId(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // 🔹 Função de validação de email
  function isEmailValid(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function handleSave(e) {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    // 🔹 Validação adicional antes de salvar
    if (!isEmailValid(form.email)) {
      setAlert({ type: "danger", msg: "Email inválido! Exemplo: usuario@dominio.com" });
      return;
    }

    setSaving(true);

    try {
      if (editId) {
        await updateUsuario({ id: editId, ...form });
        setAlert({ type: "success", msg: "Usuário atualizado!" });
      } else {
        await createUsuario(form);
        setAlert({ type: "success", msg: "Usuário criado!" });
      }

      setUsuarios(await listUsuarios());
      closeForm();
    } catch {
      setAlert({ type: "danger", msg: "Falha ao salvar usuário." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    setSaving(true);
    try {
      await deleteUsuario(id);
      setUsuarios(await listUsuarios());
      setAlert({ type: "success", msg: "Usuário excluído!" });
    } catch {
      setAlert({ type: "danger", msg: "Falha ao excluir usuário." });
    } finally {
      setSaving(false);
    }
  }

  const modalClass = `modal fade ${show ? "show d-block" : ""}`;
  const backdrop = show ? <div className="modal-backdrop fade show"></div> : null;

  return (
    <>
      <div className={modalClass} tabIndex="-1" role="dialog" aria-modal={show ? "true" : "false"}>
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-between">
              <h5 className="modal-title m-0">Usuários</h5>
              <button type="button" className="btn btn-success" onClick={openCreate} title="Adicionar Usuário">
                <span style={{ fontWeight: "bold", fontSize: 22 }}>+</span>
              </button>
            </div>

            <div className="modal-body" style={{ height: "60vh", overflowY: "auto" }}>
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
                        <th>Email</th>
                        <th>Cargo</th>
                        <th style={{ width: 100 }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id}>
                          <td>{u.email}</td>
                          <td>{u.cargo}</td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2" title="Editar" onClick={() => openEdit(u)}>
                              <span className="bi bi-pencil">✏️</span>
                            </button>
                            <button className="btn btn-sm btn-danger" title="Excluir" onClick={() => handleDelete(u.id)}>
                              <span className="bi bi-trash">🗑️</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showForm && (
              <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.2)" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={handleSave}>
                      <div className="modal-header">
                        <h5 className="modal-title">{editId ? "Editar Usuário" : "Criar Usuário"}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeForm} />
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            title="Digite um email válido. Ex: usuario@dominio.com"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Cargo</label>
                          <select className="form-select" name="cargo" value={form.cargo} onChange={handleChange} required>
                            <option value="DEVELOPER">DEVELOPER</option>
                            <option value="MANAGER">MANAGER</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Senha</label>
                          <input type="password" className="form-control" name="senha" value={form.senha} onChange={handleChange} required />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={closeForm} disabled={saving}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
      {backdrop}
    </>
  );
}
