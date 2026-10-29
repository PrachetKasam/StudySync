import { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Check,
  X,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Percent,
} from 'lucide-react'
import api from '../services/api'
import useAttendanceThreshold from '../hooks/useAttendanceThreshold'
import { useToast } from '../context/ToastContext'
import Card, { CardHeader, CardBody } from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SkeletonLoader from '../components/common/SkeletonLoader'

export function Attendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const { threshold, calculateAttendanceMetrics } = useAttendanceThreshold()
  const toast = useToast()

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null)
  const [editAttended, setEditAttended] = useState(0)
  const [editTotal, setEditTotal] = useState(0)
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/attendance')
      if (res.success) {
        setRecords(res.data)
      }
    } catch (err) {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const handleQuickLog = async (subjectId, action) => {
    try {
      const res = await api.patch(`/api/attendance/${subjectId}`, { action })
      if (res.success) {
        toast.success(
          action === 'attended'
            ? 'Marked class as attended (+1)'
            : 'Marked class as missed (+1 total)'
        )
        setRecords((prev) =>
          prev.map((r) => (r.subjectId === subjectId ? res.data : r))
        )
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance')
    }
  }

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec)
    setEditAttended(rec.attended)
    setEditTotal(rec.total)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingRecord) return

    const att = parseInt(editAttended, 10)
    const tot = parseInt(editTotal, 10)

    if (isNaN(att) || att < 0 || isNaN(tot) || tot < 0) {
      toast.error('Values cannot be negative')
      return
    }

    if (att > tot) {
      toast.error('Attended classes cannot exceed total classes')
      return
    }

    setSavingEdit(true)
    try {
      const res = await api.patch(`/api/attendance/${editingRecord.subjectId}`, {
        attended: att,
        total: tot,
      })
      if (res.success) {
        toast.success(`Attendance updated for ${editingRecord.subjectName}`)
        setRecords((prev) =>
          prev.map((r) => (r.subjectId === editingRecord.subjectId ? res.data : r))
        )
        setEditingRecord(null)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance')
    } finally {
      setSavingEdit(false)
    }
  }

  const totalAttended = records.reduce((s, r) => s + r.attended, 0)
  const totalClasses = records.reduce((s, r) => s + r.total, 0)
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0
  const isOverallLow = totalClasses > 0 && overallPercentage < threshold

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>Attendance Tracking</h1>
          <p>Monitor your subject-wise lecture attendance and maintain your {threshold}% target requirement.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="card" count={2} />
      ) : records.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={ClipboardCheck}
            title="No subjects to track"
            description="You need to enroll in at least one subject before you can track attendance."
            actionLabel="Add Subject"
            onAction={() => (window.location.href = '/subjects')}
          />
        </Card>
      ) : (
        <>
          {/* Summary Hero Card */}
          <Card className="attendance-overview-hero-card">
            <div className="overview-hero-main">
              <div className="overview-left">
                <span className="overview-kpi-label">Cumulative Academic Attendance</span>
                <div className="overview-numbers">
                  <strong className={`overview-pct ${isOverallLow ? 'text-danger' : 'text-success'}`}>
                    {overallPercentage}%
                  </strong>
                  <div className="overview-badge-wrapper">
                    <Badge variant={isOverallLow ? 'danger' : 'success'} size="md">
                      {isOverallLow ? `Below ${threshold}% Requirement` : `Above ${threshold}% Requirement`}
                    </Badge>
                  </div>
                </div>
                <p className="overview-sub">
                  <strong>{totalAttended}</strong> attended out of <strong>{totalClasses}</strong> conducted lectures across all {records.length} courses
                </p>
              </div>

              <div className="overview-mini-stat-boxes">
                <div className="mini-stat-box">
                  <span className="mini-stat-title">Target Threshold</span>
                  <strong className="mini-stat-val">{threshold}%</strong>
                </div>
                <div className="mini-stat-box">
                  <span className="mini-stat-title">Active Courses</span>
                  <strong className="mini-stat-val">{records.length}</strong>
                </div>
              </div>
            </div>

            {/* Custom Interactive Progress Bar */}
            <div className="overview-progress-bar-container">
              <div className="progress-track-wrapper">
                <div className="progress-track">
                  <div
                    className={`progress-fill ${isOverallLow ? 'progress-danger' : 'progress-success'}`}
                    style={{ width: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
                  />
                  <div
                    className="threshold-marker"
                    style={{ left: `${threshold}%` }}
                    title={`Required Threshold: ${threshold}%`}
                  >
                    <span className="marker-label">Target: {threshold}%</span>
                  </div>
                </div>
              </div>
              <div className="progress-labels-row">
                <span>0%</span>
                <span className="target-center-hint">Requirement line at {threshold}%</span>
                <span>100%</span>
              </div>
            </div>
          </Card>

          {/* Subject Attendance Cards */}
          <div className="attendance-subject-cards-grid mt-6">
            {records.map((rec) => {
              const metrics = calculateAttendanceMetrics(rec.attended, rec.total)
              return (
                <Card
                  key={rec.subjectId}
                  className={`attendance-subject-card ${metrics.isLow ? 'card-low-attendance' : 'card-on-track'}`}
                >
                  <div className="card-top-row">
                    <div>
                      <div className="subject-meta-pill-row">
                        <Badge variant="neutral" size="sm">
                          {rec.subjectCode}
                        </Badge>
                        <Badge variant={metrics.isLow ? 'danger' : 'success'} size="sm">
                          {metrics.isLow ? 'Low Attendance' : 'Good Standing'}
                        </Badge>
                      </div>
                      <h3 className="subject-heading">{rec.subjectName}</h3>
                    </div>
                    <div className="subject-pct-box">
                      <span className={`pct-big ${metrics.isLow ? 'text-danger' : 'text-success'}`}>
                        {metrics.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="subject-micro-bar">
                    <div
                      className={`micro-fill ${metrics.isLow ? 'micro-danger' : 'micro-success'}`}
                      style={{ width: `${Math.min(100, metrics.percentage)}%` }}
                    />
                  </div>

                  <div className="attendance-count-row">
                    <span className="attendance-tally-text">
                      Attended: <strong>{rec.attended}</strong> / {rec.total} classes
                    </span>
                    <button
                      type="button"
                      className="edit-counts-link"
                      onClick={() => handleOpenEdit(rec)}
                    >
                      <Edit2 size={13} />
                      <span>Edit counts</span>
                    </button>
                  </div>

                  {/* Threshold Advice Message */}
                  <div
                    className={`advice-box ${metrics.isLow ? 'advice-warning' : 'advice-positive'}`}
                  >
                    {metrics.isLow ? (
                      <AlertTriangle size={16} className="advice-icon" />
                    ) : (
                      <CheckCircle2 size={16} className="advice-icon" />
                    )}
                    <span className="advice-text">{metrics.advice}</span>
                  </div>

                  {/* Quick Action Logger */}
                  <div className="attendance-logger-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Check}
                      className="btn-log-attended"
                      onClick={() => handleQuickLog(rec.subjectId, 'attended')}
                    >
                      +1 Attended
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={X}
                      className="btn-log-missed"
                      onClick={() => handleQuickLog(rec.subjectId, 'missed')}
                    >
                      +1 Missed
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Manual Count Adjustment Modal */}
      <Modal
        isOpen={editingRecord !== null}
        onClose={() => setEditingRecord(null)}
        title={`Edit Attendance - ${editingRecord?.subjectName || ''}`}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setEditingRecord(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} loading={savingEdit}>
              Update Attendance
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="form-vertical">
          <div className="form-group">
            <label htmlFor="edit-attended" className="form-label">
              Classes Attended
            </label>
            <input
              id="edit-attended"
              type="number"
              min="0"
              className="form-input"
              value={editAttended}
              onChange={(e) => setEditAttended(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-total" className="form-label">
              Total Classes Conducted
            </label>
            <input
              id="edit-total"
              type="number"
              min={editAttended}
              className="form-input"
              value={editTotal}
              onChange={(e) => setEditTotal(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Attendance
