import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Auth API Endpoints', () => {
  const uniqueSuffix = Date.now()
  const testUser = {
    name: 'Test Student',
    email: `student_${uniqueSuffix}@example.com`,
    password: 'password123',
  }
  let authToken = ''

  it('POST /api/auth/register - successfully registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('token')
    expect(res.body.data.user).toHaveProperty('id')
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase())
    expect(res.body.data.user.name).toBe(testUser.name)
    expect(res.body.data.user).not.toHaveProperty('passwordHash')

    authToken = res.body.data.token
  })

  it('POST /api/auth/register - rejects duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toContain('already exists')
  })

  it('POST /api/auth/register - validates required and valid fields', async () => {
    const badEmailRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: '123456' })

    expect(badEmailRes.status).toBe(400)
    expect(badEmailRes.body.success).toBe(false)

    const shortPassRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'valid@example.com', password: '123' })

    expect(shortPassRes.status).toBe(400)
    expect(shortPassRes.body.success).toBe(false)
  })

  it('POST /api/auth/login - successfully logs in and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('token')
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase())
  })

  it('POST /api/auth/login - rejects incorrect password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/auth/me - returns user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.email).toBe(testUser.email.toLowerCase())
    expect(res.body.data.name).toBe(testUser.name)
  })

  it('GET /api/auth/me - rejects requests without valid token with 401', async () => {
    const noTokenRes = await request(app).get('/api/auth/me')
    expect(noTokenRes.status).toBe(401)
    expect(noTokenRes.body.success).toBe(false)

    const invalidTokenRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-string')
    expect(invalidTokenRes.status).toBe(401)
    expect(invalidTokenRes.body.success).toBe(false)
  })
})
