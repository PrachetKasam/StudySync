import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SkeletonLoader from './common/SkeletonLoader'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading-screen" role="status" aria-label="Loading authentication">
        <div className="auth-loading-card">
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
