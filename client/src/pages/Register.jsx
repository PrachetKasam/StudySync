import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import { useToast } from '../context/ToastContext'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      await register(name, email, password)
      toast.success('Account created successfully! Welcome to StudySync.')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-box" aria-hidden="true">
            <GraduationCap size={32} className="auth-logo-icon" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join StudySync to organize your academic life</p>
        </div>

        {error && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">
              Full Name
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" aria-hidden="true" />
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Email address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" aria-hidden="true" />
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm-password" className="form-label">
              Confirm Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="reg-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="form-input"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-4 auth-submit-btn"
          >
            <span>Create Account</span>
            <ArrowRight size={16} />
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
