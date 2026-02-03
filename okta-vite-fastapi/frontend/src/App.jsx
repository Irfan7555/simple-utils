import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthCallback from './components/login/AuthCallback';
import Header from './components/header/Header';
import './App.css';
import Login from './components/login/login';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
