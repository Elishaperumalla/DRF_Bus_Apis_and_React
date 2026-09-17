import React, { useState } from 'react';
import Registerform from './components/Registerform';
import Loginform from './components/Loginform';
import { Routes, Route } from 'react-router-dom';
import Buslist from './components/Buslist';
import BusSeats from './components/BusSeats';
import { UserBookings } from './components/UserBookings';
import Wrapper from "./components/Wrapper";


const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));


const handleLogin = (newToken, newUserId,newUsername) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user_id', newUserId);
      localStorage.setItem('username',newUsername)
      setToken(newToken);
      setUserId(newUserId);
      setUsername(newUsername);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      setToken(null);
      setUserId(null);
      setUsername(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id'); 
    localStorage.removeItem('username');
    setToken(null);  // reset state on logout
    setUserId(null);
    setUsername(null);
  };

  return (
    <Wrapper token={token} userId={userId} username={username} handleLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Buslist />} />
        <Route path="/register" element={<Registerform />} />
        <Route path="/login" element={<Loginform handleLogin={handleLogin} />} />
        {/* Bus seats route - accessible to everyone, but booking requires login */}
        <Route path="/buslist" element={<Buslist />} />
        <Route path="/bus/:busId" element={<BusSeats token={token} />} />
        {/* Conditional routes for authenticated users only */}
        {token && (
          <>
            <Route path="/my-bookings" element={<UserBookings token={token} userId={userId}/>} />
          </>
        )}
      </Routes>
    </Wrapper>
  );
};

export default App;
