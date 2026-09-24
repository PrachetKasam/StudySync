const getSubjects = (req, res) => {
    const subjects = [
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

    res.status(200).json({
        success: true,
        data: subjects,
    })
}

module.exports = {
    getSubjects,
}