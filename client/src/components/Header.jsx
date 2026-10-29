import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, Sliders, ChevronDown, Bell, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useAttendanceThreshold from '../hooks/useAttendanceThreshold'

export function Header({ onToggleSidebar, onOpenSettings }) {
  const { user, logout } = useAuth()
  const { threshold } = useAttendanceThreshold()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <span className="app-header-brand">StudySync</span>

        <div className="header-status-pill">
          <span className="status-dot-pulse" aria-hidden="true" />
          <span className="header-status-text">Target: {threshold}% Attendance</span>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-icon-btn"
          onClick={onOpenSettings}
          title="Attendance Settings"
          aria-label="Attendance Settings"
        >
          <Sliders size={18} />
        </button>

        <div className="user-menu-container" ref={menuRef}>
          <button
            type="button"
            className="user-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="user-info-text">
              <span className="user-name-display">{user?.name || 'Account'}</span>
            </div>
            <ChevronDown size={14} className={`chevron-icon ${menuOpen ? 'rotate' : ''}`} />
          </button>

          {menuOpen && (
            <div className="user-dropdown-menu" role="menu">
              <div className="dropdown-user-info">
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  if (onOpenSettings) onOpenSettings()
                }}
              >
                <Sliders size={16} />
                <span>Attendance Threshold: {threshold}%</span>
              </button>
              <button
                type="button"
                className="dropdown-item dropdown-item-danger"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                }}
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
