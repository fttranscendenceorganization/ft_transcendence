import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PrivateRoute from './utils/PrivateRoute';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/login';
import SignUp from './pages/signup';
import SoulSociety from './pages/soul-society';
import ZombieLand from './pages/zombie-land';
import Joker from './pages/joker';
import BarbiePink from './pages/barbie-pink';
import Exclusive from './pages/exclusive';
import Contact from './pages/contact';
import AuthCallback from './pages/AuthCallback';
import Error404 from './pages/error_404';
import Chat from './pages/chat';
import GameModes from './pages/modes';
import PrivacyPolicy from './pages/policyPage';
import TermsPage from './pages/termsPage';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import ScrollTop from './components/ScrollTop';
import FirstPage from './pages/FirstPage';
import FirstContact from './pages/FirstContact';
import Leaderboard from './pages/Leaderboard';
import GamePlay from './pages/GamePlay';
import GameJoker from './pages/GameJoker';
import GameKitty from './pages/GameKitty';
import GameSoul from './pages/GameSoul';
import EditProfile from './pages/EditProfile';
import GameHistory from './pages/GameHistory';

function Navigation() {
  const location = useLocation();

  const hideHeaderPaths = [
    '/login',
    '/signup',
    '/soul-society',
    '/zombie-land',
    '/joker',
    '/kitty-cat',
    '/chat',
    '/forgot-password',
    '/reset-password',
    '/',
    '/first-contact'
  ];

  const validPathsWithHeader = [
    '/exclusive',
    '/contact',
    '/modes',
    '/home',
    '/leaderboard',
    '/editprofile',
    '/history'
  ];

  if (hideHeaderPaths.includes(location.pathname) || !validPathsWithHeader.includes(location.pathname)) {
    return null;
  }

  return <Header />;

}

function App() {
  return (
    <Router>
      <ScrollTop />
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<FirstPage />} />
            <Route path="/first-contact" element={<FirstContact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/soul-society" element={<PrivateRoute><SoulSociety /></PrivateRoute>} />
            <Route path="/zombie-land" element={<PrivateRoute><ZombieLand /></PrivateRoute>} />
            <Route path="/joker" element={<PrivateRoute><Joker /></PrivateRoute>} />
            <Route path="/kitty-cat" element={<PrivateRoute><BarbiePink /></PrivateRoute>} />
            <Route path="/exclusive" element={<PrivateRoute><Exclusive /></PrivateRoute>} />
            <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/modes" element={<PrivateRoute><GameModes /></PrivateRoute>} />
            <Route path="/policy" element={<PrivateRoute><PrivacyPolicy /></PrivateRoute>} />
            <Route path="/terms" element={<PrivateRoute><TermsPage /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/play" element={<PrivateRoute><GamePlay /></PrivateRoute>} />
            <Route path="/Jplay" element={<PrivateRoute><GameJoker /></PrivateRoute>} />
            <Route path="/Kplay" element={<PrivateRoute><GameKitty /></PrivateRoute>} />
            <Route path="/Splay" element={<PrivateRoute><GameSoul /></PrivateRoute>} />
            <Route path="/editprofile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><GameHistory /></PrivateRoute>} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;