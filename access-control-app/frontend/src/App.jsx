import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Users from './components/Users.jsx'
import Roles from './components/Roles.jsx'
import Requests from './components/Requests.jsx'
import AuditLogs from './components/AuditLogs.jsx'

export default function App(){
  const nav = useNavigate()
  function logout(){
    localStorage.removeItem('token'); nav('/login')
  }
  return (
    <div className="container">
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <h2 style={{margin:0}}>🔐 Access Control</h2>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
        <nav style={{marginTop:12}}>
          <Link to="/">Dashboard</Link>
          <Link to="/users">Users</Link>
          <Link to="/roles">Roles</Link>
          <Link to="/requests">Requests</Link>
          <Link to="/audit">Audit Logs</Link>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/users" element={<Users/>}/>
        <Route path="/roles" element={<Roles/>}/>
        <Route path="/requests" element={<Requests/>}/>
        <Route path="/audit" element={<AuditLogs/>}/>
      </Routes>
    </div>
  )
}

function Welcome(){
  return (
    <div className="card">
      <h3>Welcome 🎉</h3>
      <p className="muted">Use the tabs above to manage Users, Roles, Access Requests, and view Audit Logs.</p>
      <div className="grid" style={{marginTop:16}}>
        <div className="card">
          <b>Quick tips</b>
          <ul>
            <li>Login with <span className="badge">admin@example.com / Admin123!</span></li>
            <li>Create roles, then assign to users.</li>
            <li>Use <b>Requests</b> for JIT-like approval flow.</li>
          </ul>
        </div>
        <div className="card">
          <b>ITGC Coverage</b>
          <ul>
            <li>Provisioning / De-provisioning</li>
            <li>Approval workflow & evidence logs</li>
            <li>Audit trail export (via API)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
