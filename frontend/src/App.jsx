import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FloorManagement from './pages/FloorManagement';
import Blueprint from './pages/Blueprint';
import Analytics from './pages/Analytics';
import OperationalEvents from './pages/OperationalEvents';
import GeoMap from './pages/GeoMap';

function App() {
  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/floors" element={<FloorManagement />} />
            <Route path="/floor/:floorId" element={<Blueprint />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/events" element={<OperationalEvents />} />
            <Route path="/geo" element={<GeoMap />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;