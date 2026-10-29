import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import useAttendanceThreshold from '../hooks/useAttendanceThreshold'
import { useToast } from '../context/ToastContext'

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { threshold, setThreshold } = useAttendanceThreshold()
  const [draftThreshold, setDraftThreshold] = useState(threshold)
  const toast = useToast()

  const handleOpenSettings = () => {
    setDraftThreshold(threshold)
    setSettingsOpen(true)
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    setThreshold(draftThreshold)
    setSettingsOpen(false)
    toast.success(`Low attendance threshold updated to ${draftThreshold}%`)
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main-layout">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSettings={handleOpenSettings}
        />

        <main className="app-content-area" id="main-content">
          {children}
        </main>
      </div>

      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Attendance Settings"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSettings} className="settings-form">
          <div className="form-group">
            <label htmlFor="threshold-input" className="form-label">
              Minimum Attendance Threshold (%)
            </label>
            <p className="form-help-text">
              Subjects with attendance percentage below this value will be flagged as low attendance.
            </p>
            <div className="threshold-input-wrapper">
              <input
                id="threshold-input"
                type="number"
                min="50"
                max="100"
                value={draftThreshold}
                onChange={(e) => setDraftThreshold(e.target.value)}
                className="form-input"
                required
              />
              <span className="input-suffix">%</span>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DashboardLayout
