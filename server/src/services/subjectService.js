let subjects = [
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

const getSubjects = () => {
    return subjects
}

const getSubjectById = (id) => {
    return subjects.find((subject) => subject.id === id)
}

const createSubject = (name, code) => {
    const newSubject = {
        id: subjects.length + 1,
        name,
        code,
    }

    subjects.push(newSubject)

    return newSubject
}

module.exports = {
    getSubjects,
    getSubjectById,
    createSubject,
}