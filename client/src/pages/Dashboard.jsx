function Dashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back to StudySync.</p>
                </div>
            </div>

            <section className="dashboard-stats">
                <div className="stat-card">
                    <span>Subjects</span>
                    <strong>6</strong>
                    <p>Active subjects</p>
                </div>

                <div className="stat-card">
                    <span>Attendance</span>
                    <strong>87%</strong>
                    <p>Overall attendance</p>
                </div>

                <div className="stat-card">
                    <span>Assignments</span>
                    <strong>4</strong>
                    <p>Pending assignments</p>
                </div>

                <div className="stat-card">
                    <span>Events</span>
                    <strong>3</strong>
                    <p>Upcoming events</p>
                </div>
            </section>

            <section className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>Upcoming Assignments</h2>
                    <p>No upcoming assignments to display.</p>
                </div>

                <div className="dashboard-card">
                    <h2>Today's Schedule</h2>
                    <p>No classes scheduled yet.</p>
                </div>
            </section>
        </div>
    )
}

export default Dashboard