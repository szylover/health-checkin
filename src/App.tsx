import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './components/pages/HomePage'
import CheckinPage from './components/pages/CheckinPage'
import CaloriesPage from './components/pages/CaloriesPage'
import EatWhatPage from './components/pages/EatWhatPage'
import PlanPage from './components/pages/PlanPage'
import ProgressPage from './components/pages/ProgressPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="checkin" element={<CheckinPage />} />
        <Route path="calories" element={<CaloriesPage />} />
        <Route path="eatwhat" element={<EatWhatPage />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="progress" element={<ProgressPage />} />
      </Route>
    </Routes>
  )
}

export default App
