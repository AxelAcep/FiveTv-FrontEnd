import { Routes, Route } from 'react-router-dom'
import Home from '../pages/user/Home'

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default UserRoutes
