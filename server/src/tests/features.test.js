import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('StudySync Core End-to-End Workflow & Security Scoping', () => {
  const time = Date.now()
  let userAToken = ''
  let userBToken = ''
  let userASubjectId = null

  it('Step 1: Register and login two separate users', async () => {
    // User A
    const regA = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Alpha', email: `alpha_${time}@test.com`, password: 'password123' })
    expect(regA.status).toBe(201)
    userAToken = regA.body.data.token

    // User B
    const regB = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Beta', email: `beta_${time}@test.com`, password: 'password123' })
    expect(regB.status).toBe(201)
    userBToken = regB.body.data.token
  })

  it('Step 2: User A adds a subject and verifies ownership', async () => {
    const res = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Computer Networks', code: 'CS301' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Computer Networks')
    userASubjectId = res.body.data.id

    // User B cannot see User A's subject
    const bSubjects = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${userBToken}`)
    expect(bSubjects.status).toBe(200)
    expect(bSubjects.body.data).toEqual([])
  })

  it('Step 3: User A records attendance with validation', async () => {
    // Quick log attended (+1/+1)
    const log1 = await request(app)
      .patch(`/api/attendance/${userASubjectId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ action: 'attended' })
    expect(log1.status).toBe(200)
    expect(log1.body.data.attended).toBe(1)
    expect(log1.body.data.total).toBe(1)
    expect(log1.body.data.percentage).toBe(100)

    // Quick log missed (+0/+1)
    const log2 = await request(app)
      .patch(`/api/attendance/${userASubjectId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ action: 'missed' })
    expect(log2.status).toBe(200)
    expect(log2.body.data.attended).toBe(1)
    expect(log2.body.data.total).toBe(2)
    expect(log2.body.data.percentage).toBe(50)

    // Reject attended > total
    const badLog = await request(app)
      .patch(`/api/attendance/${userASubjectId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ attended: 10, total: 5 })
    expect(badLog.status).toBe(400)

    // User B cannot update User A's attendance (404 Not Found)
    const crossLog = await request(app)
      .patch(`/api/attendance/${userASubjectId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ action: 'attended' })
    expect(crossLog.status).toBe(404)
  })

  it('Step 4: User A creates an assignment', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Network Packet Sniffing Lab',
        description: 'Wireshark packet capture analysis',
        subjectId: userASubjectId,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        priority: 'High',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Network Packet Sniffing Lab')
    expect(res.body.data.status).toBe('Pending')

    // User B cannot see User A's assignment
    const bAssignments = await request(app)
      .get('/api/assignments')
      .set('Authorization', `Bearer ${userBToken}`)
    expect(bAssignments.status).toBe(200)
    expect(bAssignments.body.data).toEqual([])
  })

  it('Step 5: User A adds a class to timetable', async () => {
    const res = await request(app)
      .post('/api/timetable')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        subjectId: userASubjectId,
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lab 4B',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.day).toBe('Monday')
    expect(res.body.data.room).toBe('Lab 4B')
  })

  it('Step 6: Dashboard aggregates real user data', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?threshold=75')
      .set('Authorization', `Bearer ${userAToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.stats.totalSubjects).toBe(1)
    expect(res.body.data.stats.totalClasses).toBe(2)
    expect(res.body.data.stats.totalAttended).toBe(1)
    expect(res.body.data.stats.overallAttendancePercentage).toBe(50)
    expect(res.body.data.stats.pendingAssignmentsCount).toBe(1)
    expect(res.body.data.upcomingAssignments.length).toBe(1)

    // User B dashboard has 0 stats and empty arrays
    const bDashboard = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${userBToken}`)
    expect(bDashboard.status).toBe(200)
    expect(bDashboard.body.data.stats.totalSubjects).toBe(0)
    expect(bDashboard.body.data.stats.overallAttendancePercentage).toBe(0)
    expect(bDashboard.body.data.upcomingAssignments).toEqual([])
  })
})
