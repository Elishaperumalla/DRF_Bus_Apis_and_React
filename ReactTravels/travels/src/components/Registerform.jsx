import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Registerform.css';

const RegisterForm = () => {
  const navigate = useNavigate(); 

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(form.email)) {
      setMessage('❌ Invalid email format');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...formData } = form;
      await axios.post('http://localhost:8000/api/register/', formData);
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login'); // Redirect to login page
      }, 1500); // wait for 1.5 seconds before redirecting
    } catch (error) {
      const errMsg =
        error.response?.data?.username?.[0] || error.message;
      setMessage('❌ Registration failed: ' + (error.response?.data?.username||error.message));
    }
  };

return (
  <div className="register-container">
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register</h2>

      <label>Username</label>
      <input
        type="text"
        name="username"
        value={form.username}
        onChange={handleChange}
        required
      />

      <label>Email</label>
      <input
        type="email"
        name="email"
        value={form.email}
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

      <label>Confirm Password</label>
      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />

      <button type="submit">Register</button>

      {message && <p>{message}</p>}
    </form>
  </div>
);

};

export default RegisterForm;
