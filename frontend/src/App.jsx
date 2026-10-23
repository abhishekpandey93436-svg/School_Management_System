import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './redux/authSlice';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css'; // Global styling

function App() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Router>
      <div className="ambient-3d-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
        <div className="ambient-grid"></div>
      </div>
      <Routes>
        <Route path="/" element={!userInfo ? <Login /> : <Navigate to={userInfo.role === 'Admin' ? "/admin-dashboard" : "/student-dashboard"} />} />
        <Route path="/student-dashboard" element={userInfo ? <StudentDashboard /> : <Navigate to="/" />} />
        <Route path="/admin-dashboard" element={userInfo && userInfo.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
