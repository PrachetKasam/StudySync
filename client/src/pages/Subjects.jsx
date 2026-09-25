const subjects = [
    {
        name: 'Data Structures',
        code: 'CS201',
        teacher: 'Dr. Sharma',
        credits: 4,
    },
    {
        name: 'Database Management',
        code: 'CS202',
        teacher: 'Prof. Mehta',
        credits: 4,
    },
    {
        name: 'Operating Systems',
        code: 'CS203',
        teacher: 'Dr. Patel',
        credits: 4,
    },
    {
        name: 'Computer Networks',
        code: 'CS204',
        teacher: 'Prof. Rao',
        credits: 3,
    },
    {
        name: 'Web Development',
        code: 'CS205',
        teacher: 'Dr. Kapoor',
        credits: 3,
    },
    {
        name: 'Software Engineering',
        code: 'CS206',
        teacher: 'Prof. Singh',
        credits: 3,
    },
]

function Subjects() {
    return (
        <div className="subjects-page">
            <div className="page-header">
                <div>
                    <h1>Subjects</h1>
                    <p>Manage and view your current subjects.</p>
                </div>
            </div>

            <div className="subjects-grid">
                {subjects.map((subject) => (
                    <div className="subject-card" key={subject.code}>
                        <div className="subject-card-header">
                            <span className="subject-code">{subject.code}</span>
                            <span className="subject-credits">
                                {subject.credits} Credits
                            </span>
                        </div>

                        <h2>{subject.name}</h2>
                        <p>{subject.teacher}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Subjects