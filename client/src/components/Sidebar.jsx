import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  CalendarDays,
  Calendar,
  Megaphone,
  Library,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

const navSections = [
  {
    title: 'ACADEMICS',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Subjects', path: '/subjects', icon: BookOpen },
      { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
      { label: 'Assignments', path: '/assignments', icon: ClipboardList },
      { label: 'Timetable', path: '/timetable', icon: CalendarDays },
    ],
  },
  {
    title: 'CAMPUS LIFE',
    items: [
      { label: 'Events', path: '/events', icon: Calendar },
      { label: 'Notices', path: '/notices', icon: Megaphone },
      { label: 'Resources', path: '/resources', icon: Library },
    ],
  },
]

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-logo">
          <div className="sidebar-brand-wrapper">
            <div className="brand-icon-box" aria-hidden="true">
              <GraduationCap size={22} className="brand-icon" />
            </div>
            <div className="brand-text-wrapper">
              <h2 className="brand-title">StudySync</h2>
              <span className="brand-subtitle">Student Portal</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section-group">
              <span className="nav-section-title">{section.title}</span>
              <div className="nav-section-items">
                {section.items.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => {
                      if (isOpen && onClose) onClose()
                    }}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                    end={path === '/'}
                  >
                    <Icon size={18} strokeWidth={2} className="nav-item-icon" />
                    <span className="nav-item-text">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-pro-card">
            <div className="pro-card-header">
              <Sparkles size={16} className="pro-sparkle-icon" />
              <span className="pro-title">Academic Track</span>
            </div>
            <p className="pro-desc">All systems synced & active</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
