import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { renderHook, act } from '@testing-library/react'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import useAttendanceThreshold from '../hooks/useAttendanceThreshold'

describe('Frontend Auth Pages & Attendance Threshold Hook', () => {
  it('renders Login page inputs and buttons properly', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders Register page with all required input fields', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('useAttendanceThreshold correctly calculates percentage and missable/needed classes', () => {
    const { result } = renderHook(() => useAttendanceThreshold())

    expect(result.current.threshold).toBe(75)

    // Above threshold: 18 / 20 = 90% (>= 75%)
    // Can miss: floor(18 / 0.75 - 20) = floor(24 - 20) = 4 classes
    const good = result.current.calculateAttendanceMetrics(18, 20)
    expect(good.percentage).toBe(90)
    expect(good.isLow).toBe(false)
    expect(good.classesToMiss).toBe(4)
    expect(good.advice).toContain('safely miss 4 more classes')

    // Below threshold: 12 / 20 = 60% (< 75%)
    // Needed: ceil((0.75 * 20 - 12) / (1 - 0.75)) = ceil(3 / 0.25) = 12 classes
    const low = result.current.calculateAttendanceMetrics(12, 20)
    expect(low.percentage).toBe(60)
    expect(low.isLow).toBe(true)
    expect(low.classesToAttend).toBe(12)
    expect(low.advice).toContain('Need to attend next 12 classes')

    // Zero classes recorded
    const empty = result.current.calculateAttendanceMetrics(0, 0)
    expect(empty.percentage).toBe(0)
    expect(empty.isLow).toBe(false)
  })
})
