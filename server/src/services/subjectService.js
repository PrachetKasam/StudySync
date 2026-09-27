const getSubjects = () => {
    return [
        {
            id: 1,
            name: 'Mathematics',
            code: 'MATH101',
        },
        {
            id: 2,
            name: 'Physics',
            code: 'PHY101',
        },
        {
            id: 3,
            name: 'Computer Science',
            code: 'CS101',
        },
    ]
}

const getSubjectById = (id) => {
    const subjects = getSubjects()

    return subjects.find((subject) => subject.id === id)
}

module.exports = {
    getSubjects,
    getSubjectById,
}