import React from 'react'
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor'
import CreateProject from './components/CreateProject'
import ProjectPage from './pages/ProjectPage'


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/new" element={<CreateProject />} />
            <Route path="/project/:id/edit" element={<ProjectEditor />} />  
            <Route path="/project/:id" element={<ProjectPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App