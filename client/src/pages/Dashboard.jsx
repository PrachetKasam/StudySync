import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  CalendarDays,
  Plus,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import useAttendanceThreshold from '../hooks/useAttendanceThreshold'
import { useToast } from '../context/ToastContext'
import Card, { CardHeader, CardBody } from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import SkeletonLoader from '../components/common/SkeletonLoader'
import Modal from '../components/common/Modal'

export function Dashboard() {
  const { user } = useAuth()
  const { threshold } = useAttendanceThreshold()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [subjects, setSubjects] = useState([])
  
  // Quick Add Subject Modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [subjectCode, setSubjectCode] = useState('')
  const [creatingSubject, setCreatingSubject] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const [dashRes, subRes] = await Promise.all([
        api.get(`/api/dashboard/summary?threshold=${threshold}`),
        api.get('/api/subjects'),
      ])
      if (dashRes.success) setData(dashRes.data)
      if (subRes.success) setSubjects(subRes.data)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [threshold, toast])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    if (!subjectName.trim() || !subjectCode.trim()) return

    setCreatingSubject(true)
    try {
      const res = await api.post('/api/subjects', {
        name: subjectName.trim(),
        code: subjectCode.trim(),
      })
      if (res.success) {
        toast.success(`Subject "${res.data.name}" added`)
        setSubjectModalOpen(false)
        setSubjectName('')
        setSubjectCode('')
        fetchDashboardData()
      }
    } catch (err) {
      toast.error(err.message || 'Could not add subject')
    } finally {
      setCreatingSubject(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Loading your academic summary...</p>
          </div>
        </div>
        <SkeletonLoader type="card" count={4} />
      </div>
    )
  }

  const stats = data?.stats || {
    totalSubjects: 0,
    overallAttendancePercentage: 0,
    totalAttended: 0,
    totalClasses: 0,
    pendingAssignmentsCount: 0,
    overdueAssignmentsCount: 0,
  }

  const isAttendanceLow = stats.totalClasses > 0 && stats.overallAttendancePercentage < threshold

  return (
    <div className="dashboard-page">
      <div className="page-header dashboard-welcome-header">
        <div>
          <h1>Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}!</h1>
          <p>Here is what is happening with your studies today ({data?.todayDayName || 'Today'}).</p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setSubjectModalOpen(true)}
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <section className="dashboard-stats-grid" aria-label="Key Performance Indicators">
        <Link to="/subjects" className="stat-card-link">
          <Card className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Active Subjects</span>
              <div className="stat-icon-wrapper stat-icon-indigo" aria-hidden="true">
                <BookOpen size={20} />
              </div>
            </div>
            <strong className="stat-value">{stats.totalSubjects}</strong>
            <p className="stat-hint">
              {stats.totalSubjects === 0 ? 'No subjects enrolled' : 'Enrolled this term'}
            </p>
          </Card>
        </Link>

        <Link to="/attendance" className="stat-card-link">
          <Card className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Overall Attendance</span>
              <div
                className={`stat-icon-wrapper ${isAttendanceLow ? 'stat-icon-danger' : 'stat-icon-emerald'}`}
                aria-hidden="true"
              >
                <ClipboardCheck size={20} />
              </div>
            </div>
            <div className="stat-value-with-badge">
              <strong className="stat-value">{stats.overallAttendancePercentage}%</strong>
              {stats.totalClasses > 0 && (
                <Badge variant={isAttendanceLow ? 'danger' : 'success'}>
                  {isAttendanceLow ? 'Low' : 'On Track'}
                </Badge>
              )}
            </div>
            <p className="stat-hint">
              {stats.totalClasses > 0
                ? `${stats.totalAttended} of ${stats.totalClasses} classes attended`
                : 'No classes recorded'}
            </p>
          </Card>
        </Link>

        <Link to="/assignments" className="stat-card-link">
          <Card className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Pending Assignments</span>
              <div className="stat-icon-wrapper stat-icon-amber" aria-hidden="true">
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="stat-value-with-badge">
              <strong className="stat-value">{stats.pendingAssignmentsCount}</strong>
              {stats.overdueAssignmentsCount > 0 && (
                <Badge variant="danger">{stats.overdueAssignmentsCount} Overdue</Badge>
              )}
            </div>
            <p className="stat-hint">
              {stats.pendingAssignmentsCount === 0
                ? 'All caught up!'
                : `${stats.pendingAssignmentsCount} tasks to complete`}
            </p>
          </Card>
        </Link>

        <Link to="/timetable" className="stat-card-link">
          <Card className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Today's Schedule</span>
              <div className="stat-icon-wrapper stat-icon-sky" aria-hidden="true">
                <CalendarDays size={20} />
              </div>
            </div>
            <strong className="stat-value">{data?.todayClasses?.length || 0}</strong>
            <p className="stat-hint">
              {data?.todayClasses?.length === 0
                ? 'No classes scheduled'
                : `Classes for ${data?.todayDayName}`}
            </p>
          </Card>
        </Link>
      </section>

      {/* Meaningful Empty State if zero data */}
      {stats.totalSubjects === 0 ? (
        <Card className="mt-6 p-8">
          <EmptyState
            icon={BookOpen}
            title="Start setting up your semester"
            description="Add your enrolled subjects to begin recording attendance, scheduling classes, and tracking assignments."
            actionLabel="Add Your First Subject"
            onAction={() => setSubjectModalOpen(true)}
          />
        </Card>
      ) : (
        <div className="dashboard-content-columns mt-6">
          {/* Today's Classes */}
          <Card className="dashboard-panel">
            <CardHeader
              title={`Today's Classes (${data?.todayDayName})`}
              subtitle="Your classes scheduled for today"
              action={
                <Link to="/timetable" className="panel-action-link">
                  <span>View Timetable</span>
                  <ArrowRight size={14} />
                </Link>
              }
            />
            <CardBody>
              {data?.todayClasses?.length === 0 ? (
                <div className="dashboard-empty-panel">
                  <CheckCircle2 size={32} className="text-muted-icon" />
                  <p>No classes scheduled for today. Enjoy your day!</p>
                  <Link to="/timetable">
                    <Button variant="outline" size="sm">
                      Check Weekly Timetable
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="schedule-list">
                  {data.todayClasses.map((item) => (
                    <div key={item.id} className="schedule-item">
                      <div className="schedule-time">
                        <Clock size={16} />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                      <div className="schedule-details">
                        <h4>{item.subjectName}</h4>
                        <div className="schedule-meta">
                          <span className="badge-tag">{item.subjectCode}</span>
                          {item.room && <span className="room-tag">Room {item.room}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Upcoming Assignments */}
          <Card className="dashboard-panel">
            <CardHeader
              title="Upcoming Assignments"
              subtitle="Tasks due soon that require your focus"
              action={
                <Link to="/assignments" className="panel-action-link">
                  <span>All Assignments</span>
                  <ArrowRight size={14} />
                </Link>
              }
            />
            <CardBody>
              {data?.upcomingAssignments?.length === 0 ? (
                <div className="dashboard-empty-panel">
                  <CheckCircle2 size={32} className="text-muted-icon" />
                  <p>No pending assignments right now. You are all caught up!</p>
                  <Link to="/assignments">
                    <Button variant="outline" size="sm">
                      Add New Assignment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="upcoming-assignments-list">
                  {data.upcomingAssignments.map((a) => (
                    <div
                      key={a.id}
                      className={`upcoming-item ${a.isOverdue ? 'item-overdue' : ''}`}
                    >
                      <div className="upcoming-item-info">
                        <span className="subject-chip">{a.subjectCode || a.subjectName}</span>
                        <h4>{a.title}</h4>
                        <p className="due-date-text">
                          Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'No date'}
                        </p>
                      </div>
                      <div className="upcoming-item-badges">
                        {a.isOverdue && <Badge variant="danger">Overdue</Badge>}
                        {!a.isOverdue && a.isDueSoon && <Badge variant="warning">Due Soon</Badge>}
                        <Badge variant={a.priority === 'High' ? 'danger' : 'neutral'}>
                          {a.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Quick Add Subject Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="Add New Subject"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubject}
              loading={creatingSubject}
            >
              Add Subject
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubject} className="subject-form">
          <div className="form-group">
            <label htmlFor="modal-sub-name" className="form-label">
              Subject Name
            </label>
            <input
              id="modal-sub-name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Distributed Systems"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="modal-sub-code" className="form-label">
              Subject Code
            </label>
            <input
              id="modal-sub-code"
              type="text"
              required
              className="form-input"
              placeholder="e.g. CS401"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Dashboard
