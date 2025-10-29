import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import RecommendationFinder from './Pages/RecommendationFinder';
import Results from './Pages/Results';

function App() {
  // No authentication, so no user or loading state needed

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/finder" element={<RecommendationFinder user={null} />} />
        <Route path="/results" element={<Results user={null} />} />
      </Routes>
    </Router>
  );
}

export default App;
