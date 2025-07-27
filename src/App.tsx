import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminRoutes from './routes/admin.routes'
import UserRoutes from './routes/user.routes'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </Router>
  )
}

export default App
