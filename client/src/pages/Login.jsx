import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Mail, Lock, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import { useToast } from '../context/ToastContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back to StudySync!')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = () => {
    setEmail('prachet@example.com')
    setPassword('Password123!')
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-box" aria-hidden="true">
            <GraduationCap size={32} className="auth-logo-icon" />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your StudySync student dashboard</p>
        </div>

        {error && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" aria-hidden="true" />
              <input
                id="login-email"
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
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <span>Sign in to StudySync</span>
            <ArrowRight size={16} />
          </Button>
        </form>

        <div className="auth-demo-hint">
          <button type="button" className="demo-fill-btn" onClick={fillDemoAccount}>
            <Sparkles size={13} />
            <span>Click to fill demo account credentials</span>
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Do not have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
