import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FloorManagement from './pages/FloorManagement';
import Blueprint from './pages/Blueprint';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="flex bg-slate-900 min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/floors" element={<FloorManagement />} />
            <Route path="/floor/:floorId" element={<Blueprint />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;