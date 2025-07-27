import { Routes, Route } from 'react-router-dom'
import Login from '../pages/admin/Login'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

export default AdminRoutes
