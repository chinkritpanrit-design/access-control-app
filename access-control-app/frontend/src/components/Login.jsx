import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin123!')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      nav('/')
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:'80px auto'}}>
        <h2>Sign in</h2>
        <p className="muted">Use the seeded admin credentials to start.</p>
        <form onSubmit={submit}>
          <div>
            <label>Email</label><br/>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>
          </div>
          <div style={{marginTop:12}}>
            <label>Password</label><br/>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          {err && <p style={{color:'#fca5a5'}}>{err}</p>}
          <button className="btn" disabled={loading} style={{marginTop:12, width:'100%'}}>{loading?'Signing in…':'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}
