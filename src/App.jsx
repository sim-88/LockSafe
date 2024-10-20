import './App.css';
import Manager from './components/Manager';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmailVerification from './components/EmailVerification';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation(); // To get the current path
  const navigate = useNavigate();  // To programmatically navigate

  // Simulate email verification check
  useEffect(() => {
    const emailVerified = localStorage.getItem('isVerified');
    if (emailVerified) {
      setIsVerified(true);
    }
  }, []);

  // Handle successful verification and redirect to Manager
  const handleVerification = () => {
    setIsVerified(true);
    localStorage.setItem('isVerified', 'true'); // Persist verification status
    navigate('/'); // Redirect to Manager after verification
  };

  return (
    <>
      {/* Conditionally render Navbar if not on the verification page */}
      {location.pathname !== "/verify" && <Navbar />}

      <Routes>
        {/* Email verification route */}
        <Route path="/verify" element={<EmailVerification onVerify={handleVerification} />} />
        
        {/* Protected route for Manager */}
        <Route 
          path="/" 
          element={isVerified ? (
            <div className='bg-gray-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]'>
              <Manager />
            </div>
          ) : (
            <Navigate to="/verify" />
          )}
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
