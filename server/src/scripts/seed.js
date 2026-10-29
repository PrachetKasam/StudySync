const db = require('../db')
const { hashPassword } = require('../utils/password')

async function seed() {
  console.log('Seeding demo data for StudySync development testing...')
  const email = 'demo@studysync.edu'
  
  let user = await db.orm.public.User.where({ email }).first()
  if (!user) {
    const passwordHash = await hashPassword('demopassword123')
    user = await db.orm.public.User.create({
      name: 'Demo Student',
      email,
      passwordHash,
    })
    console.log(`Created demo user: ${email} (password: demopassword123)`)
  } else {
    console.log(`Demo user already exists: ${email}`)
  }

  // Check if subjects exist
  const existingSubjects = await db.orm.public.Subject.where({ userId: user.id }).all()
  if (existingSubjects.length === 0) {
    const demoSubjects = [
      { name: 'Data Structures & Algorithms', code: 'CS201', attended: 18, total: 20 },
      { name: 'Database Management Systems', code: 'CS202', attended: 14, total: 20 },
      { name: 'Operating Systems', code: 'CS203', attended: 17, total: 20 },
      { name: 'Computer Networks', code: 'CS204', attended: 19, total: 20 },
      { name: 'Software Engineering', code: 'CS205', attended: 13, total: 18 },
    ]

    for (const sub of demoSubjects) {
      const subject = await db.orm.public.Subject.create({
        name: sub.name,
        code: sub.code,
        userId: user.id,
      })
      await db.orm.public.Attendance.create({
        subjectId: subject.id,
        attended: sub.attended,
        total: sub.total,
      })

      // Add sample assignment
      await db.orm.public.Assignment.create({
        userId: user.id,
        subjectId: subject.id,
        title: `${sub.code} Midterm Project`,
        description: `Implement core components for ${sub.name}.`,
        dueDate: Temporal.Now.instant().add({ hours: 72 }),
        priority: 'High',
        status: 'Pending',
      })

      // Add sample timetable slot
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const day = days[Math.floor(Math.random() * days.length)]
      await db.orm.public.Timetable.create({
        userId: user.id,
        subjectId: subject.id,
        day,
        startTime: '10:00',
        endTime: '11:30',
        room: `Hall ${subject.id + 100}`,
      })
    }
    console.log('Demo subjects, attendance, assignments, and timetable seeded!')
  } else {
    console.log('Demo data already exists, skipping duplicate seed.')
  }

  console.log('Seeding complete.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err)
    process.exit(1)
  })
