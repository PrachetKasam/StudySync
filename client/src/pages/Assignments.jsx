const assignmentsData = [
    {
        title: 'Binary Search Tree Implementation',
        subject: 'Data Structures',
        dueDate: '28 Sep 2026',
        status: 'Pending',
    },
    {
        title: 'Database Normalization Report',
        subject: 'Database Management',
        dueDate: '30 Sep 2026',
        status: 'Pending',
    },
    {
        title: 'Operating Systems Case Study',
        subject: 'Operating Systems',
        dueDate: '2 Oct 2026',
        status: 'Pending',
    },
    {
        title: 'Network Protocol Analysis',
        subject: 'Computer Networks',
        dueDate: '5 Oct 2026',
        status: 'Pending',
    },
]

function Assignments() {
    return (
        <div className="assignments-page">
            <div className="page-header">
                <div>
                    <h1>Assignments</h1>
                    <p>Keep track of your upcoming assignments.</p>
                </div>
            </div>

            <div className="assignments-summary">
                <div className="assignment-summary-card">
                    <span>Pending Assignments</span>
                    <strong>{assignmentsData.length}</strong>
                    <p>Assignments that need your attention</p>
                </div>
            </div>

            <div className="assignments-list">
                {assignmentsData.map((assignment) => (
                    <div
                        className="assignment-card"
                        key={assignment.title}
                    >
                        <div className="assignment-card-content">
                            <div>
                                <span className="assignment-subject">
                                    {assignment.subject}
                                </span>

                                <h2>{assignment.title}</h2>
                            </div>

                            <span className="assignment-status">
                                {assignment.status}
                            </span>
                        </div>

                        <div className="assignment-footer">
                            <span>Due date</span>
                            <strong>{assignment.dueDate}</strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Assignments