import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import ParichaySammelan from './pages/ParichaySammelan';
import Donation from './pages/Donation';
import Contact from './pages/Contact';
import Helpline from './pages/Helpline';
import Login from './pages/Login';
import Register from './pages/Register';
import Members from './pages/Members';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRequest from './pages/AdminRequest';
import ParichayBooks from './pages/ParichayBooks';
import './i18n';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="events" element={<Events />} />
            <Route path="parichay" element={<ParichaySammelan />} />
            <Route path="donate" element={<Donation />} />
            <Route path="helpline" element={<Helpline />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="admin-login" element={<AdminLogin />} />
            <Route path="admin-request" element={<AdminRequest />} />
            <Route path="register" element={<Register />} />
            <Route path="members" element={<Members />} />
            <Route path="profile" element={<Profile />} />
            <Route path="books" element={<ParichayBooks />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
