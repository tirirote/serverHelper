import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout.jsx';
import Playground from './pages/Playground.jsx';
import Dashboard from './pages/Dashboard.jsx'; // Futuro componente del Dashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* La ruta principal ahora será el Dashboard */}
          <Route index element={<Dashboard />} /> 
          
          {/* El Playground tendrá su propia ruta */}
          <Route path="playground" element={<Playground />} />
          
          {/* Aquí irán las demás rutas de la app */}
          <Route path="workspaces" element={<h1>Workspaces View</h1>} />
          <Route path="shop" element={<h1>Shop View</h1>} />
          <Route path="components" element={<h1>Components View</h1>} />
          <Route path="servers" element={<h1>Servers View</h1>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;