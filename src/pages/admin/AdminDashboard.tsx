import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchProjects, createProject, updateProject,
  deleteProject, fetchProject, clearAdminToken, Project
} from '../../lib/api'
import AdminProjectForm from './AdminProjectForm'
import AdminSiteSettings from './AdminSiteSettings'
import { Plus, Pencil, Trash2, LogOut, RefreshCw, ExternalLink, Loader2, Settings } from 'lucide-react'

type ProjectSummary = Pick<Project, 'id' | 'name' | 'location' | 'category' | 'year' | 'badge' | 'concept' | 'coverImage'>
type AdminTab = 'projects' | 'site-settings'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('projects')
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
          <div
            className={`adm-nav-item ${tab === 'projects' ? 'adm-nav-active' : ''}`}
            onClick={() => setTab('projects')}
          >
            Projects
          </div>
          <div
            className={`adm-nav-item ${tab === 'site-settings' ? 'adm-nav-active' : ''}`}
            onClick={() => setTab('site-settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Settings size={13} /> Site Settings
          </div>
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
            {tab === 'projects' ? (
              <>
                <h1 className="adm-page-title">Portfolio Projects</h1>
                <span className="adm-count">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
              </>
            ) : (
              <h1 className="adm-page-title">Site Settings</h1>
            )}
          </div>
          <div className="adm-topbar-right">
            {tab === 'projects' ? (
              <>
                <button className="adm-btn-ghost-sm" onClick={load} title="Refresh">
                  <RefreshCw size={15} />
                </button>
                <a href="/portfolio" target="_blank" rel="noreferrer" className="adm-btn-ghost-sm" title="View site">
                  <ExternalLink size={15} />
                </a>
                <button className="adm-btn-add" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Add Project
                </button>
              </>
            ) : (
              <a href="/" target="_blank" rel="noreferrer" className="adm-btn-ghost-sm" title="View site">
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </header>

        {/* Messages (projects tab only) */}
        {tab === 'projects' && successMsg && <div className="adm-success">{successMsg}</div>}
        {tab === 'projects' && error && <div className="adm-error">{error} <button onClick={() => setError('')}>×</button></div>}

        {/* Content */}
        <div className="adm-content">
          {tab === 'site-settings' ? (
            <AdminSiteSettings />
          ) : loading ? (
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
          background: #f0ebe3; font-family: Arial, sans-serif;
        }
        .adm-sidebar {
          width: 220px; min-height: 100vh; flex-shrink: 0;
          background: #ffffff; border-right: 1px solid #e2d9ce;
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh;
        }
        .adm-sidebar-brand { padding: 28px 24px 20px; border-bottom: 1px solid #ede8e1; }
        .adm-brand-name {
          display: block; font-size: 24px; color: #7a6245;
          font-family: Georgia, serif; font-style: italic; letter-spacing: 0.1em;
        }
        .adm-brand-sub {
          display: block; font-size: 9px; letter-spacing: 0.35em;
          color: #c0b5a8; text-transform: uppercase; margin-top: 2px;
        }
        .adm-nav { flex: 1; padding: 16px 0; }
        .adm-nav-item {
          padding: 10px 24px; font-size: 13px; color: #9a8e82;
          cursor: pointer; transition: all 0.2s;
          border-left: 2px solid transparent;
        }
        .adm-nav-active { color: #7a6245; border-left-color: #7a6245; background: rgba(122,98,69,0.06); }
        .adm-sidebar-footer { padding: 20px 24px; border-top: 1px solid #ede8e1; }
        .adm-logout {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #9a8e82;
          cursor: pointer; font-size: 13px; padding: 0;
          transition: color 0.2s;
        }
        .adm-logout:hover { color: #b85a4a; }
        .adm-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .adm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 32px; border-bottom: 1px solid #e2d9ce;
          background: #ffffff; position: sticky; top: 0; z-index: 10;
          box-shadow: 0 1px 0 #e2d9ce;
        }
        .adm-topbar-left { display: flex; align-items: baseline; gap: 12px; }
        .adm-page-title { margin: 0; font-size: 18px; color: #1a1612; font-weight: normal; letter-spacing: 0.03em; }
        .adm-count { font-size: 12px; color: #c0b5a8; }
        .adm-topbar-right { display: flex; align-items: center; gap: 10px; }
        .adm-btn-ghost-sm {
          background: none; border: 1px solid #ddd7ce; color: #9a8e82;
          border-radius: 4px; padding: 7px 9px; cursor: pointer;
          display: flex; align-items: center; transition: all 0.2s;
          text-decoration: none;
        }
        .adm-btn-ghost-sm:hover { border-color: #7a6245; color: #7a6245; }
        .adm-btn-add {
          display: flex; align-items: center; gap: 8px;
          background: #7a6245; color: #ffffff; border: none;
          border-radius: 4px; padding: 9px 18px; font-size: 13px;
          letter-spacing: 0.08em; cursor: pointer; font-weight: 600;
          transition: background 0.2s; text-transform: uppercase;
        }
        .adm-btn-add:hover { background: #6a5438; }
        .adm-success {
          margin: 16px 32px 0; background: #f0f7f0; border: 1px solid #b5d9b5;
          color: #3a7a3a; border-radius: 4px; padding: 10px 16px; font-size: 13px;
        }
        .adm-error {
          margin: 16px 32px 0; background: #fdf0ee; border: 1px solid #e8b5ad;
          color: #b85a4a; border-radius: 4px; padding: 10px 16px; font-size: 13px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .adm-error button { background: none; border: none; color: #b85a4a; cursor: pointer; font-size: 18px; }
        .adm-content { padding: 24px 32px; flex: 1; }
        .adm-loading, .adm-empty {
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 16px; color: #b0a498;
          font-size: 14px; padding: 80px 0;
        }
        .adm-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .adm-table-wrap { overflow-x: auto; border-radius: 6px; border: 1px solid #e2d9ce; background: #fff; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table thead tr { background: #faf8f5; }
        .adm-table th {
          padding: 12px 16px; font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #b0a498; font-weight: 600;
          text-align: left; border-bottom: 1px solid #ede8e1; white-space: nowrap;
        }
        .adm-table td {
          padding: 14px 16px; font-size: 13px; color: #2a2218;
          border-bottom: 1px solid #f0ebe3; vertical-align: middle;
        }
        .adm-table tbody tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover td { background: #faf8f5; }
        .adm-thumb {
          width: 56px; height: 38px; object-fit: cover;
          border-radius: 4px; border: 1px solid #e2d9ce; display: block;
        }
        .adm-thumb-placeholder {
          width: 56px; height: 38px; background: #f0ebe3;
          border-radius: 4px; display: flex; align-items: center; justify-content: center;
          color: #c0b5a8; font-size: 12px;
        }
        .adm-name { color: #1a1612; font-size: 14px; font-weight: 500; }
        .adm-slug { color: #c0b5a8; font-size: 11px; margin-top: 2px; font-family: monospace; }
        .adm-cell-muted { color: #9a8e82; }
        .adm-badge {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 11px; text-transform: capitalize; letter-spacing: 0.05em; font-weight: 500;
        }
        .adm-badge-residential { background: #eaf4ea; color: #3a7a3a; }
        .adm-badge-commercial   { background: #eaf0f8; color: #2a5a8a; }
        .adm-badge-architecture { background: #f8f0ea; color: #8a4a2a; }
        .adm-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .adm-action-btn {
          background: none; border: 1px solid #ddd7ce; color: #9a8e82;
          border-radius: 4px; padding: 6px 8px; cursor: pointer;
          display: flex; align-items: center; transition: all 0.2s;
        }
        .adm-action-btn:hover { border-color: #7a6245; color: #7a6245; }
        .adm-action-del:hover { border-color: #b85a4a; color: #b85a4a; }
        .adm-confirm { display: flex; align-items: center; gap: 6px; }
        .adm-confirm span { font-size: 12px; color: #b85a4a; }
        .adm-confirm-yes {
          background: #b85a4a; color: #fff; border: none; border-radius: 4px;
          padding: 4px 10px; font-size: 12px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
        }
        .adm-confirm-no {
          background: none; border: 1px solid #ddd7ce; color: #9a8e82;
          border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer;
        }
        .adm-confirm-no:hover { color: #7a6245; border-color: #7a6245; }
      `}</style>
    </div>
  )
}
