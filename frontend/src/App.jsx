import './App.css'
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./context/ProtectedRoute";

import LoginPage from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import TeamDetail from './pages/TeamDetail';
import PlayerDetail from './pages/PlayerDetail';
import Dashboard from './pages/Dashboard';

import MainLayout from './layouts/MainLayout';
import Profile from './pages/Profile';
import TeamManagement from './pages/TeamManagement';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/manage/:id" element={<TeamManagement/>}/>
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetail />} />


              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;