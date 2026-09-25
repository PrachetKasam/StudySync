const attendanceData = [
    {
        subject: 'Data Structures',
        attended: 18,
        total: 20,
    },
    {
        subject: 'Database Management',
        attended: 16,
        total: 20,
    },
    {
        subject: 'Operating Systems',
        attended: 17,
        total: 20,
    },
    {
        subject: 'Computer Networks',
        attended: 19,
        total: 20,
    },
    {
        subject: 'Web Development',
        attended: 15,
        total: 18,
    },
    {
        subject: 'Software Engineering',
        attended: 16,
        total: 18,
    },
]

function Attendance() {
    const totalAttended = attendanceData.reduce(
        (sum, subject) => sum + subject.attended,
        0,
    )

    const totalClasses = attendanceData.reduce(
        (sum, subject) => sum + subject.total,
        0,
    )

    const overallPercentage = Math.round(
        (totalAttended / totalClasses) * 100,
    )

    return (
        <div className="attendance-page">
            <div className="page-header">
                <div>
                    <h1>Attendance</h1>
                    <p>Track your attendance across all subjects.</p>
                </div>
            </div>

            <div className="attendance-summary">
                <div className="attendance-summary-card">
                    <span>Overall Attendance</span>
                    <strong>{overallPercentage}%</strong>
                    <p>
                        {totalAttended} of {totalClasses} classes attended
                    </p>
                </div>
            </div>

            <div className="attendance-table-card">
                <div className="attendance-table-header">
                    <h2>Subject Attendance</h2>
                </div>

                <div className="attendance-table">
                    <div className="attendance-row attendance-heading">
                        <span>Subject</span>
                        <span>Attended</span>
                        <span>Total</span>
                        <span>Percentage</span>
                    </div>

                    {attendanceData.map((subject) => {
                        const percentage = Math.round(
                            (subject.attended / subject.total) * 100,
                        )

                        return (
                            <div
                                className="attendance-row"
                                key={subject.subject}
                            >
                                <span className="attendance-subject">
                                    {subject.subject}
                                </span>

                                <span>{subject.attended}</span>

                                <span>{subject.total}</span>

                                <span className="attendance-percentage">
                                    {percentage}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Attendance