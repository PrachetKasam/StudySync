import { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Check,
  X,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
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
        toast.success(action === 'attended' ? 'Marked class as attended (+1)' : 'Marked class as missed (+1 total)')
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
          <p>Monitor your attendance percentage and maintain the required {threshold}% threshold.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="card" count={2} />
      ) : records.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={ClipboardCheck}
            title="No subjects to track"
            description="You need to add at least one subject before you can track attendance."
            actionLabel="Add Subject"
            onAction={() => (window.location.href = '/subjects')}
          />
        </Card>
      ) : (
        <>
          {/* Summary Banner */}
          <div className="attendance-summary-banner">
            <Card className="attendance-overview-card">
              <div className="overview-left">
                <span className="overview-label">Overall Attendance</span>
                <div className="overview-numbers">
                  <strong className="overview-pct">{overallPercentage}%</strong>
                  <Badge variant={isOverallLow ? 'danger' : 'success'} size="md">
                    {isOverallLow ? `Below ${threshold}% Target` : `Above ${threshold}% Target`}
                  </Badge>
                </div>
                <p className="overview-sub">
                  {totalAttended} of {totalClasses} total lectures attended across all {records.length} subjects
                </p>
              </div>

              <div className="overview-progress-bar-container">
                <div className="progress-track">
                  <div
                    className={`progress-fill ${isOverallLow ? 'progress-danger' : 'progress-success'}`}
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                  <div
                    className="threshold-marker"
                    style={{ left: `${threshold}%` }}
                    title={`Threshold: ${threshold}%`}
                  >
                    <span className="marker-label">{threshold}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Subject Attendance Cards */}
          <div className="attendance-subject-cards-grid mt-6">
            {records.map((rec) => {
              const metrics = calculateAttendanceMetrics(rec.attended, rec.total)
              return (
                <Card key={rec.subjectId} className="attendance-subject-card">
                  <div className="card-top-row">
                    <div>
                      <Badge variant="neutral" size="sm">
                        {rec.subjectCode}
                      </Badge>
                      <h3 className="subject-heading">{rec.subjectName}</h3>
                    </div>
                    <div className="subject-pct-box">
                      <span className={`pct-big ${metrics.isLow ? 'text-danger' : 'text-success'}`}>
                        {metrics.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="attendance-count-row">
                    <span>
                      Attended: <strong>{rec.attended}</strong> / {rec.total} classes
                    </span>
                    <button
                      type="button"
                      className="edit-counts-link"
                      onClick={() => handleOpenEdit(rec)}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Threshold Advice Message */}
                  <div
                    className={`advice-box ${metrics.isLow ? 'advice-warning' : 'advice-positive'}`}
                  >
                    {metrics.isLow ? (
                      <AlertTriangle size={15} className="advice-icon" />
                    ) : (
                      <CheckCircle2 size={15} className="advice-icon" />
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
