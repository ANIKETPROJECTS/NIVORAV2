import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchProjects, createProject, updateProject,
  deleteProject, fetchProject, clearAdminToken, Project
} from '../../lib/api'
import AdminProjectForm from './AdminProjectForm'
import { Plus, Pencil, Trash2, LogOut, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'

type ProjectSummary = Pick<Project, 'id' | 'name' | 'location' | 'category' | 'year' | 'badge' | 'concept' | 'coverImage'>

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleLogout = () => {
    clearAdminToken()
    navigate('/adminpannel')
  }

  const handleAdd = async (data: Partial<Project>) => {
    await createProject(data)
    await load()
    setShowForm(false)
    flash('Project created successfully.')
  }

  const handleEditOpen = async (id: string) => {
    try {
      const full = await fetchProject(id)
      setEditingProject(full)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  const handleUpdate = async (data: Partial<Project>) => {
    if (!editingProject?.id) return
    await updateProject(editingProject.id, data)
    await load()
    setEditingProject(null)
    flash('Project updated successfully.')
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteProject(id)
      await load()
      flash('Project deleted.')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-brand-name">nivora</span>
          <span className="adm-brand-sub">admin</span>
        </div>
        <nav className="adm-nav">
          <div className="adm-nav-item adm-nav-active">Projects</div>
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-logout" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <h1 className="adm-page-title">Portfolio Projects</h1>
            <span className="adm-count">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
          </div>
          <div className="adm-topbar-right">
            <button className="adm-btn-ghost-sm" onClick={load} title="Refresh">
              <RefreshCw size={15} />
            </button>
            <a href="/portfolio" target="_blank" rel="noreferrer" className="adm-btn-ghost-sm" title="View site">
              <ExternalLink size={15} />
            </a>
            <button className="adm-btn-add" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Project
            </button>
          </div>
        </header>

        {/* Messages */}
        {successMsg && <div className="adm-success">{successMsg}</div>}
        {error && <div className="adm-error">{error} <button onClick={() => setError('')}>×</button></div>}

        {/* Content */}
        <div className="adm-content">
          {loading ? (
            <div className="adm-loading"><Loader2 size={28} className="adm-spin" /> Loading projects…</div>
          ) : projects.length === 0 ? (
            <div className="adm-empty">
              <p>No projects yet.</p>
              <button className="adm-btn-add" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Add Your First Project
              </button>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Year</th>
                    <th>Badge</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.coverImage
                          ? <img src={p.coverImage} alt={p.name} className="adm-thumb" />
                          : <div className="adm-thumb-placeholder">—</div>}
                      </td>
                      <td>
                        <div className="adm-name">{p.name}</div>
                        <div className="adm-slug">{p.id}</div>
                      </td>
                      <td className="adm-cell-muted">{p.location || '—'}</td>
                      <td>
                        <span className={`adm-badge adm-badge-${p.category}`}>{p.category}</span>
                      </td>
                      <td className="adm-cell-muted">{p.year || '—'}</td>
                      <td className="adm-cell-muted">{p.badge || '—'}</td>
                      <td>
                        <div className="adm-actions">
                          <button className="adm-action-btn" onClick={() => handleEditOpen(p.id)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          {confirmDelete === p.id ? (
                            <div className="adm-confirm">
                              <span>Delete?</span>
                              <button
                                className="adm-confirm-yes"
                                onClick={() => handleDelete(p.id)}
                                disabled={deletingId === p.id}
                              >
                                {deletingId === p.id ? <Loader2 size={12} className="adm-spin" /> : 'Yes'}
                              </button>
                              <button className="adm-confirm-no" onClick={() => setConfirmDelete(null)}>No</button>
                            </div>
                          ) : (
                            <button
                              className="adm-action-btn adm-action-del"
                              onClick={() => setConfirmDelete(p.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Form */}
      {showForm && (
        <AdminProjectForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingProject && (
        <AdminProjectForm
          initial={editingProject}
          onSave={handleUpdate}
          onCancel={() => setEditingProject(null)}
          isEdit
        />
      )}

      <style>{`
        * { box-sizing: border-box; }
        .adm-root {
          min-height: 100vh; display: flex;
          background: #0e110d; font-family: Arial, sans-serif;
        }
        .adm-sidebar {
          width: 220px; min-height: 100vh; flex-shrink: 0;
          background: #111510; border-right: 1px solid #1e241b;
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh;
        }
        .adm-sidebar-brand { padding: 28px 24px 20px; border-bottom: 1px solid #1e241b; }
        .adm-brand-name {
          display: block; font-size: 24px; color: #c9b89a;
          font-family: Georgia, serif; font-style: italic; letter-spacing: 0.1em;
        }
        .adm-brand-sub {
          display: block; font-size: 9px; letter-spacing: 0.35em;
          color: #3a4036; text-transform: uppercase; margin-top: 2px;
        }
        .adm-nav { flex: 1; padding: 16px 0; }
        .adm-nav-item {
          padding: 10px 24px; font-size: 13px; color: #5a6354;
          cursor: pointer; transition: all 0.2s;
          border-left: 2px solid transparent;
        }
        .adm-nav-active { color: #c9b89a; border-left-color: #c9b89a; background: rgba(201,184,154,0.05); }
        .adm-sidebar-footer { padding: 20px 24px; border-top: 1px solid #1e241b; }
        .adm-logout {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #5a6354;
          cursor: pointer; font-size: 13px; padding: 0;
          transition: color 0.2s;
        }
        .adm-logout:hover { color: #c07a6a; }
        .adm-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .adm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 32px; border-bottom: 1px solid #1e241b;
          background: #111510; position: sticky; top: 0; z-index: 10;
        }
        .adm-topbar-left { display: flex; align-items: baseline; gap: 12px; }
        .adm-page-title { margin: 0; font-size: 18px; color: #c9b89a; font-weight: normal; letter-spacing: 0.05em; }
        .adm-count { font-size: 12px; color: #3a4036; }
        .adm-topbar-right { display: flex; align-items: center; gap: 10px; }
        .adm-btn-ghost-sm {
          background: none; border: 1px solid #2a3026; color: #7a8a72;
          border-radius: 3px; padding: 7px 9px; cursor: pointer;
          display: flex; align-items: center; transition: all 0.2s;
          text-decoration: none;
        }
        .adm-btn-ghost-sm:hover { border-color: #c9b89a; color: #c9b89a; }
        .adm-btn-add {
          display: flex; align-items: center; gap: 8px;
          background: #c9b89a; color: #0e110d; border: none;
          border-radius: 3px; padding: 9px 18px; font-size: 13px;
          letter-spacing: 0.08em; cursor: pointer; font-weight: 600;
          transition: background 0.2s; text-transform: uppercase;
        }
        .adm-btn-add:hover { background: #d4c9b0; }
        .adm-success {
          margin: 16px 32px 0; background: #1a2a1a; border: 1px solid #2a5a2a;
          color: #7ab87a; border-radius: 3px; padding: 10px 16px; font-size: 13px;
        }
        .adm-error {
          margin: 16px 32px 0; background: #2a1515; border: 1px solid #5a2020;
          color: #c07a6a; border-radius: 3px; padding: 10px 16px; font-size: 13px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .adm-error button { background: none; border: none; color: #c07a6a; cursor: pointer; font-size: 18px; }
        .adm-content { padding: 24px 32px; flex: 1; }
        .adm-loading, .adm-empty {
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 16px; color: #5a6354;
          font-size: 14px; padding: 80px 0;
        }
        .adm-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .adm-table-wrap { overflow-x: auto; border-radius: 4px; border: 1px solid #1e241b; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table thead tr { background: #111510; }
        .adm-table th {
          padding: 12px 16px; font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #3a4036; font-weight: normal;
          text-align: left; border-bottom: 1px solid #1e241b; white-space: nowrap;
        }
        .adm-table td {
          padding: 14px 16px; font-size: 13px; color: #c9b89a;
          border-bottom: 1px solid #1a1e18; vertical-align: middle;
        }
        .adm-table tbody tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover td { background: rgba(201,184,154,0.03); }
        .adm-thumb {
          width: 56px; height: 38px; object-fit: cover;
          border-radius: 3px; border: 1px solid #2a2f26; display: block;
        }
        .adm-thumb-placeholder {
          width: 56px; height: 38px; background: #1e241b;
          border-radius: 3px; display: flex; align-items: center; justify-content: center;
          color: #3a4036; font-size: 12px;
        }
        .adm-name { color: #d4c9b0; font-size: 14px; }
        .adm-slug { color: #3a4036; font-size: 11px; margin-top: 2px; font-family: monospace; }
        .adm-cell-muted { color: #5a6354; }
        .adm-badge {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 11px; text-transform: capitalize; letter-spacing: 0.05em;
        }
        .adm-badge-residential { background: #1e2a1e; color: #7ab87a; }
        .adm-badge-commercial { background: #1e2026; color: #7a9ab8; }
        .adm-badge-architecture { background: #2a201e; color: #b8977a; }
        .adm-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .adm-action-btn {
          background: none; border: 1px solid #2a3026; color: #7a8a72;
          border-radius: 3px; padding: 6px 8px; cursor: pointer;
          display: flex; align-items: center; transition: all 0.2s;
        }
        .adm-action-btn:hover { border-color: #c9b89a; color: #c9b89a; }
        .adm-action-del:hover { border-color: #c07a6a; color: #c07a6a; }
        .adm-confirm { display: flex; align-items: center; gap: 6px; }
        .adm-confirm span { font-size: 12px; color: #c07a6a; }
        .adm-confirm-yes {
          background: #c07a6a; color: #fff; border: none; border-radius: 3px;
          padding: 4px 10px; font-size: 12px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
        }
        .adm-confirm-no {
          background: none; border: 1px solid #2a3026; color: #5a6354;
          border-radius: 3px; padding: 4px 10px; font-size: 12px; cursor: pointer;
        }
        .adm-confirm-no:hover { color: #c9b89a; }
      `}</style>
    </div>
  )
}
