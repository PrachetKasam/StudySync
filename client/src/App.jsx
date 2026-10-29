import { BrowserRouter, Routes, Route } from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'

import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Attendance from './pages/Attendance'
import Assignments from './pages/Assignments'
import Timetable from './pages/Timetable'
import Events from './pages/Events'
import Notices from './pages/Notices'
import Resources from './pages/Resources'

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/events" element={<Events />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App