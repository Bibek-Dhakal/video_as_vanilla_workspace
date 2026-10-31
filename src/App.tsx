import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { VideoStudio } from './components/VideoStudio';
import { ScriptList } from './components/ScriptList';
import { SCRIPTS } from './scripts/registry';

function StudioWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const script = SCRIPTS.find(s => s.id === id);
  
  if (!script) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--fg)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <h2>Script not found</h2>
        <button onClick={() => navigate('/')}>Return to Scripts</button>
      </div>
    );
  }
  
  return <VideoStudio script={script} onBack={() => navigate('/')} />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ScriptList />} />
          <Route path="/studio/:id" element={<StudioWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;