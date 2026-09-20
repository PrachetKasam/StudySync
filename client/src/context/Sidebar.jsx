function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>StudySync</h2>
            </div>

            <nav className="sidebar-nav">
                <a href="/">Dashboard</a>
                <a href="/subjects">Subjects</a>
                <a href="/attendance">Attendance</a>
                <a href="/assignments">Assignments</a>
                <a href="/timetable">Timetable</a>
                <a href="/events">Events</a>
                <a href="/notices">Notices</a>
                <a href="/resources">Resources</a>
            </nav>
        </aside>
    )
}

export default Sidebar