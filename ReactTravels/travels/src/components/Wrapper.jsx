
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import './Wrapper.css';
import { FaHeadset, FaTags, FaSearch, FaUser, FaTicketAlt } from 'react-icons/fa';
import axios from 'axios';

const Wrapper = ({ token, username, userId, handleLogout, children }) => {
  const [bookings, setBookings] = useState([]);
  const prevTokenRef = useRef(null);
  const hasMountedRef = useRef(false);

  // ✅ Welcome toast - show when token changes from null to a value (login)
  useEffect(() => {
    // On first mount, just store the initial token value and mark as mounted
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevTokenRef.current = token;
      return; // Don't show toast on initial mount/refresh
    }
    
    // Only show toast when token changes from null/undefined to a value (user just logged in)
    // This means the user actually logged in, not just a page refresh
    if (token && !prevTokenRef.current && username) {
      toast.success(`Welcome ${username || "there"}! 🎉`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    // Update ref to track previous token value for next render
    prevTokenRef.current = token;
  }, [token, username]);

  // ✅ Fetch user bookings when logged in
  useEffect(() => {
    const fetchBookings = async () => {
      if (!token || !userId) return;
      try {
        const response = await axios.get(
          `http://localhost:8000/api/user/${userId}/bookings/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [token, userId]);

  // ✅ Logout
  // const logout = () => {
  //   handleLogout();
  //   toast.info("👋 You have logged out.");
  //   window.location.href = "/";
  // };
  const navigate= useNavigate();
const logout = () => {
  handleLogout(); // must clear state
  toast.info("👋 You have logged out.");
  navigate("/")
};
  return (
    <div className="wrapper-container">
      <div className="navbar">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <span className="logo-text">
              <strong>book</strong> <span className="highlight">Ur</span>{" "}
              <strong>Trip</strong>
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="nav-links">
          <Link to="/offers"><FaTags /> Offers</Link>
          <Link to="/track"><FaSearch /> Track Ticket</Link>
          <Link to="/NeedHelp.jsx"><FaHeadset /> Need Help</Link>

          {/* ✅ Show bookings if logged in */}
          {token && (
            <Link to="/my-bookings" className="bookings-link">
              <FaTicketAlt /> My Bookings
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="auth-section">
          {token ? (
            <>
              <span className="welcome-text">Welcome, {username}</span>
              <button onClick={logout}><FaUser /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button><FaUser /> Login</button></Link>
              <Link to="/register"><button>SignUp</button></Link>
            </>
          )}
        </div>
      </div>

      <main>{children}</main>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default Wrapper;
