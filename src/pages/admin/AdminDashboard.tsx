import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchProjects, createProject, updateProject,
  deleteProject, fetchProject, clearAdminToken, Project
} from '../../lib/api'
import AdminProjectForm from './AdminProjectForm'
import AdminSiteSettings, { SettingsSection } from './AdminSiteSettings'
import {
  Plus, Pencil, Trash2, LogOut, RefreshCw, ExternalLink, Loader2,
  LayoutTemplate, Image, AlignLeft, Grid2X2, Home, Briefcase,
  ChevronDown, ChevronRight, Sparkles, Columns, List,
} from 'lucide-react'

type ProjectSummary = Pick<Project, 'id' | 'name' | 'location' | 'category' | 'year' | 'badge' | 'concept' | 'coverImage'>

type AdminTab = 'projects' | `settings/${SettingsSection}`

// ── Sidebar page/section definition ──────────────────────────────────────────

interface SidebarItem {
  tab: AdminTab
  label: string
  icon: React.ElementType
  hint?: string
}

interface SidebarPage {
  id: string
  label: string
  icon: React.ElementType
  items: SidebarItem[]
}

const SIDEBAR_PAGES: SidebarPage[] = [
  {
    id: 'home',
    label: 'Home Page',
    icon: Home,
    items: [
      { tab: 'settings/header',    label: 'Header',      icon: AlignLeft,      hint: 'Navbar logo' },
      { tab: 'settings/hero',      label: 'Hero Section', icon: Sparkles,      hint: 'Full-screen hero banner' },
      { tab: 'settings/expertise', label: 'Our Expertise', icon: Grid2X2,      hint: 'Service cards section' },
      { tab: 'settings/footer',    label: 'Footer',       icon: LayoutTemplate, hint: 'Footer logo' },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio Page',
    icon: Image,
    items: [
      { tab: 'projects', label: 'Portfolio Projects', icon: Columns, hint: 'Manage all portfolio projects' },
    ],
  },
  {
    id: 'service',
    label: 'Service Page',
    icon: Briefcase,
    items: [
      { tab: 'settings/services', label: 'Services', icon: List, hint: 'Individual service listings' },
    ],
  },
]

// Which page owns a given tab?
function ownerPageId(tab: AdminTab): string {
  for (const page of SIDEBAR_PAGES) {
    if (page.items.some(i => i.tab === tab)) return page.id
  }
  return 'home'
}

// Human-readable tab label
function tabLabel(tab: AdminTab): string {
  for (const page of SIDEBAR_PAGES) {
    const item = page.items.find(i => i.tab === tab)
    if (item) return item.label
  }
  return 'Admin'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('projects')
  const [openPages, setOpenPages] = useState<Set<string>>(new Set(['portfolio']))

  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }

  const load = async () => {
    setLoading(true); setError('')
    try { setProjects(await fetchProjects()) }
    catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleLogout = () => { clearAdminToken(); navigate('/adminpannel') }

  const handleAdd = async (data: Partial<Project>) => {
    await createProject(data); await load(); setShowForm(false); flash('Project created successfully.')
  }
  const handleEditOpen = async (id: string) => {
    try { setEditingProject(await fetchProject(id)) }
    catch (e: unknown) { setError((e as Error).message) }
  }
  const handleUpdate = async (data: Partial<Project>) => {
    if (!editingProject?.id) return
    await updateProject(editingProject.id, data); await load(); setEditingProject(null); flash('Project updated successfully.')
  }
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try { await deleteProject(id); await load(); flash('Project deleted.') }
    catch (e: unknown) { setError((e as Error).message) }
    finally { setDeletingId(null); setConfirmDelete(null) }
  }

  const navigate2 = (newTab: AdminTab) => {
    setTab(newTab)
    // Auto-open the parent page when a subsection is selected
    setOpenPages(prev => new Set([...prev, ownerPageId(newTab)]))
  }

  const togglePage = (pageId: string) => {
    setOpenPages(prev => {
      const next = new Set(prev)
      if (next.has(pageId)) next.delete(pageId)
      else next.add(pageId)
      return next
    })
  }

  const isSettingsTab = tab.startsWith('settings/')
  const activeSection = isSettingsTab ? (tab.replace('settings/', '') as SettingsSection) : null

  return (
    <div className="adm-root">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-brand-name">nivora</span>
          <span className="adm-brand-sub">admin</span>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-group-label">Pages</div>

          {SIDEBAR_PAGES.map(page => {
            const isOpen = openPages.has(page.id)
            const PageIcon = page.icon
            const Chevron = isOpen ? ChevronDown : ChevronRight
            const pageActive = page.items.some(i => i.tab === tab)

            return (
              <div key={page.id}>
                {/* Page header row */}
                <div
                  className={`adm-page-row ${pageActive ? 'adm-page-row-active' : ''}`}
                  onClick={() => togglePage(page.id)}
                >
                  <PageIcon size={13} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{page.label}</span>
                  <Chevron size={11} style={{ flexShrink: 0, opacity: 0.5 }} />
                </div>

                {/* Sub-items */}
                {isOpen && (
                  <div className="adm-sub-items">
                    {page.items.map(item => {
                      const ItemIcon = item.icon
                      return (
                        <div
                          key={item.tab}
                          className={`adm-nav-item adm-nav-sub ${tab === item.tab ? 'adm-nav-active' : ''}`}
                          onClick={() => navigate2(item.tab)}
                          title={item.hint}
                        >
                          <ItemIcon size={12} style={{ flexShrink: 0, opacity: 0.75 }} />
                          {item.label}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-logout" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <h1 className="adm-page-title">{tabLabel(tab)}</h1>
            {tab === 'projects' && (
              <span className="adm-count">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
            )}
          </div>
          <div className="adm-topbar-right">
            {tab === 'projects' ? (
              <>
                <button className="adm-btn-ghost-sm" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
                <a href="/portfolio" target="_blank" rel="noreferrer" className="adm-btn-ghost-sm" title="View portfolio">
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

        {/* Messages */}
        {tab === 'projects' && successMsg && <div className="adm-success">{successMsg}</div>}
        {tab === 'projects' && error && (
          <div className="adm-error">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Content */}
        <div className="adm-content">
          {isSettingsTab && activeSection ? (
            <AdminSiteSettings section={activeSection} />
          ) : loading ? (
            <div className="adm-loading">
              <Loader2 size={28} className="adm-spin" /> Loading projects…
            </div>
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
                    <th>Cover</th><th>Name</th><th>Location</th>
                    <th>Category</th><th>Year</th><th>Badge</th>
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
                      <td><span className={`adm-badge adm-badge-${p.category}`}>{p.category}</span></td>
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
                              <button className="adm-confirm-yes" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                                {deletingId === p.id ? <Loader2 size={12} className="adm-spin" /> : 'Yes'}
                              </button>
                              <button className="adm-confirm-no" onClick={() => setConfirmDelete(null)}>No</button>
                            </div>
                          ) : (
                            <button className="adm-action-btn adm-action-del" onClick={() => setConfirmDelete(p.id)} title="Delete">
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
      {showForm && <AdminProjectForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}

      {/* Edit Form */}
      {editingProject && (
        <AdminProjectForm initial={editingProject} onSave={handleUpdate} onCancel={() => setEditingProject(null)} isEdit />
      )}

      <style>{`
        * { box-sizing: border-box; }
        .adm-root {
          min-height: 100vh; display: flex;
          background: #f0ebe3; font-family: Arial, sans-serif;
        }
        .adm-sidebar {
          width: 230px; min-height: 100vh; flex-shrink: 0;
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
        .adm-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
        .adm-nav-group-label {
          padding: 8px 24px 4px;
          font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #c0b5a8; font-weight: 600; user-select: none;
        }
        /* Page header row */
        .adm-page-row {
          padding: 10px 20px 10px 24px; font-size: 13px; color: #6b5d4f;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 8px;
          font-weight: 500; user-select: none;
          border-left: 2px solid transparent;
        }
        .adm-page-row:hover { background: rgba(122,98,69,0.04); color: #3d2e1e; }
        .adm-page-row-active { color: #7a6245; }
        /* Sub-items container */
        .adm-sub-items { background: #faf8f5; border-bottom: 1px solid #f0ebe3; }
        /* Nav items (sub-level) */
        .adm-nav-item {
          padding: 8px 20px; font-size: 12.5px; color: #9a8e82;
          cursor: pointer; transition: all 0.15s;
          border-left: 2px solid transparent;
          display: flex; align-items: center; gap: 8px;
        }
        .adm-nav-sub { padding-left: 36px; }
        .adm-nav-item:hover { color: #5a4730; background: rgba(122,98,69,0.05); }
        .adm-nav-active {
          color: #7a6245; border-left-color: #7a6245;
          background: rgba(122,98,69,0.08); font-weight: 500;
        }
        .adm-sidebar-footer { padding: 20px 24px; border-top: 1px solid #ede8e1; }
        .adm-logout {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #9a8e82;
          cursor: pointer; font-size: 13px; padding: 0; transition: color 0.2s;
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
        .adm-content { padding: 28px 32px; flex: 1; max-width: 820px; }
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
