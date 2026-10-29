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

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>StudySync</h2>
            </div>

            <nav className="sidebar-nav">
                {navigationItems.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            isActive ? 'active' : ''
                        }
                    >
                        <Icon size={20} strokeWidth={2} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar