import { Link } from 'react-router-dom'

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>StudySync</h2>
            </div>

            <nav className="sidebar-nav">
                <Link to="/">Dashboard</Link>
                <Link to="/subjects">Subjects</Link>
                <Link to="/attendance">Attendance</Link>
                <Link to="/assignments">Assignments</Link>
                <Link to="/timetable">Timetable</Link>
                <Link to="/events">Events</Link>
                <Link to="/notices">Notices</Link>
                <Link to="/resources">Resources</Link>
            </nav>
        </aside>
    )
}

export default Sidebar