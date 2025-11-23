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
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [cargoLocked, setCargoLocked] = useState(false);

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
    setEditId(usuario.usuario_id ?? usuario.id);
    // Não trazemos a senha do backend por segurança. Oferecemos opção de alterar.
    setForm({ email: usuario.email, senha: "", cargo: usuario.cargo });
    // se o usuário sendo editado for ETL ou ADMIN, bloqueia alteração do cargo
    const isLocked = String(usuario.cargo).toUpperCase() === "ETL" || String(usuario.cargo).toUpperCase() === "ADMIN";
    setCargoLocked(isLocked);
    setChangePassword(false);
    setShowPassword(false);
    setShowForm(true);
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

  function openCreate() {
    setEditId(null);
    setForm({ email: "", senha: "", cargo: "DEVELOPER" });
    setCargoLocked(false);
    setChangePassword(true); // criação exige senha
    setShowPassword(false);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm({ email: "", senha: "", cargo: "DEVELOPER" });
    setEditId(null);
    setChangePassword(false);
    setShowPassword(false);
    setCargoLocked(false);
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

    // validação de senha: criação sempre precisa; edição apenas se changePassword=true
    if (!editId && !form.senha) {
      setAlert({ type: "danger", msg: "Senha obrigatória ao criar usuário." });
      return;
    }

    if (editId && changePassword && !form.senha) {
      setAlert({ type: "danger", msg: "Informe a nova senha ou desmarque 'Alterar senha'." });
      return;
    }

    setSaving(true);

    try {
      if (editId) {
        // Preservar senha atual se o usuário não optou por alterá-la
        const payload = { id: editId, email: form.email, cargo: form.cargo };
        if (changePassword) payload.senha = form.senha;
        await updateUsuario(payload);
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
                        <tr key={u.usuario_id ?? u.id}>
                          <td>{u.email}</td>
                          <td>{u.cargo}</td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2" title="Editar" onClick={() => openEdit(u)}>
                              <span className="bi bi-pencil">✏️</span>
                            </button>
                            <button className="btn btn-sm btn-danger" title="Excluir" onClick={() => handleDelete(u.usuario_id ?? u.id)}>
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
                          {cargoLocked ? (
                            <input type="text" className="form-control" value={form.cargo} readOnly />
                          ) : (
                            <select className="form-select" name="cargo" value={form.cargo} onChange={handleChange} required>
                              <option value="DEVELOPER">DEVELOPER</option>
                              <option value="MANAGER">MANAGER</option>
                            </select>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Senha</label>
                          {editId ? (
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="changePassword"
                                checked={changePassword}
                                onChange={() => setChangePassword((c) => !c)}
                              />
                              <label className="form-check-label" htmlFor="changePassword">
                                Alterar senha
                              </label>
                            </div>
                          ) : null}

                          {(!editId || changePassword) && (
                            <div className="input-group">
                              <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                name="senha"
                                value={form.senha}
                                onChange={handleChange}
                                required={!editId}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary password-toggle-btn"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showPassword ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
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
