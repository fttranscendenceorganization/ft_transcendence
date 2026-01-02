import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        {}
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {}
            {}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;