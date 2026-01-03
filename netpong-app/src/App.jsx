import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/login';
import SignUp from './pages/signup';
import SaulSociety from './pages/saul-society';

function Navigation() {
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/signup', '/saul-society'];
  if (hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  return <Header />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        { }
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/saul-society" element={<SaulSociety />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;