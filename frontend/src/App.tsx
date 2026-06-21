import { Route, Routes } from 'react-router-dom'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { LandingPage } from './pages/LandingPage'
import { SchedulePage } from './pages/SchedulePage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
    </Routes>
  )
}
