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
} from 'lucide-react'

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Subjects', path: '/subjects', icon: BookOpen },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
  { label: 'Assignments', path: '/assignments', icon: ClipboardList },
  { label: 'Timetable', path: '/timetable', icon: CalendarDays },
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'Notices', path: '/notices', icon: Megaphone },
  { label: 'Resources', path: '/resources', icon: Library },
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
            <GraduationCap size={28} className="brand-icon" />
            <h2>StudySync</h2>
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
          {navigationItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => {
                if (isOpen && onClose) onClose()
              }}
              className={({ isActive }) => (isActive ? 'active' : '')}
              end={path === '/'}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
