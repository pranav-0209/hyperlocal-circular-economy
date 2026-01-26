import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />  // ← MUST have this
        <Route path="/login" element={<div>Login Coming Soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
