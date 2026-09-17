import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


const getAuth = () => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('user_id'),
  role: localStorage.getItem('role'),
  isUser: localStorage.getItem('is_user') === 'true',
});

const LoginForm = ({ handleLogin }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [auth, setAuth] = useState(getAuth());

  const navigate = useNavigate();

 
  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:8000/api/login/',
        form
      );

      const { token, user_id, username } = response.data;

   
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', username);

     
      handleLogin(token, user_id, username);

      setMessage('✅ Login successful!');
      setIsSuccess(true);

    
      navigate('/');
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message;
      setMessage('❌ Login failed: ' + errMsg);
      setIsSuccess(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>
          <FaUser /> {auth.token ? 'Welcome Back!' : 'Login'}
        </h2>

        {!auth.token ? (
          <>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit">Login</button>
          </>
        ) : (
          <p>✅ You are already logged in</p>
        )}

        {message && (
          <p className={isSuccess ? 'success' : 'error'}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginForm;