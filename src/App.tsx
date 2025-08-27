import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Upload from './pages/Upload';
import Prompt from './pages/Prompt';
import Subtitle from './pages/Subtitle';
import Processing from './pages/Processing';
import Preview from './pages/Preview';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/subtitle" element={<Subtitle />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/preview" element={<Preview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
