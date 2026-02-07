import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentReport } from './pages/StudentReport';
import { AdminDashboard } from './pages/AdminDashboard';
import { Reports } from './pages/Reports';
import { Classes } from './pages/Classes';
import { Login } from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentReport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/classes" element={<Classes />} />
      </Routes>
    </Router>
  );
}

export default App;
