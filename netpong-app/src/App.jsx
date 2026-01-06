import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/login';
import SignUp from './pages/signup';
import SaulSociety from './pages/saul-society';
import ZombieLand from './pages/zombie-land';
import Joker from './pages/joker';
import BarbiePink from './pages/barbie-pink';
import Exclusive from './pages/exclusive';

function Navigation() {
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/signup', '/saul-society', '/zombie-land', '/joker', '/barbie-pink'];
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
            <Route path="/zombie-land" element={<ZombieLand />} />
            <Route path="/joker" element={<Joker />} />
            <Route path="/barbie-pink" element={<BarbiePink />} />
            <Route path="/exclusive" element={<Exclusive />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;