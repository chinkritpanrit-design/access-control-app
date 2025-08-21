import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Users(){
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({ email:'', name:'', dept:'', password:'' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [userRoles, setUserRoles] = useState([])
  const [err, setErr] = useState('')

  async function load(){
    try {
      const [u, r] = await Promise.all([ api.get('/users'), api.get('/roles') ])
      setUsers(u.data); setRoles(r.data)
    } catch(e){ setErr(e?.response?.data?.error || 'Failed to load') }
  }
  useEffect(()=>{ load() }, [])

  async function createUser(e){
    e.preventDefault()
    try{
      await api.post('/users', form)
      setForm({ email:'', name:'', dept:'', password:'' })
      await load()
    }catch(e){ alert(e?.response?.data?.error || 'Create failed') }
  }

  function pick(u){
    setSelectedUser(u)
    api.get(`/users/${u.id}/roles`).then(r=> setUserRoles(r.data.map(x=>x.id)))
  }

  async function saveRoles(){
    if(!selectedUser) return;
    await api.post(`/users/${selectedUser.id}/roles`, { roleIds: userRoles })
    alert('Roles saved')
  }

  async function removeUser(id){
    if(!confirm('Delete user?')) return
    await api.delete(`/users/${id}`)
    await load()
  }

  return (
    <div className="card">
      <h3>Users</h3>
      {err && <p style={{color:'#fca5a5'}}>{err}</p>}
      <div className="grid" style={{marginTop:12}}>
        <div className="card">
          <b>Create User</b>
          <form onSubmit={createUser}>
            <div className="row">
              <div className="col">
                <label>Email</label>
                <input className="input" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
              </div>
              <div className="col">
                <label>Name</label>
                <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
              </div>
            </div>
            <div className="row" style={{marginTop:8}}>
              <div className="col">
                <label>Dept</label>
                <input className="input" value={form.dept} onChange={e=>setForm({...form, dept:e.target.value})}/>
              </div>
              <div className="col">
                <label>Password</label>
                <input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
              </div>
            </div>
            <button className="btn" style={{marginTop:12}}>Create</button>
          </form>
        </div>
        <div className="card">
          <b>User List</b>
          <table style={{marginTop:8}}>
            <thead><tr><th>Email</th><th>Name</th><th>Dept</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.dept}</td>
                  <td>
                    <button className="btn" onClick={()=>pick(u)}>Roles</button>
                    <button className="btn" style={{marginLeft:6}} onClick={()=>removeUser(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="card" style={{marginTop:14}}>
          <b>Assign Roles to {selectedUser.email}</b>
          <div style={{display:'flex', flexWrap:'wrap', gap:10, marginTop:8}}>
            {roles.map(r=>{
              const checked = userRoles.includes(r.id)
              return (
                <label key={r.id} style={{border:'1px solid #1f2937', padding:'8px 10px', borderRadius:10}}>
                  <input type="checkbox" checked={checked} onChange={(e)=>{
                    if (e.target.checked) setUserRoles([...userRoles, r.id])
                    else setUserRoles(userRoles.filter(x=>x!==r.id))
                  }} /> <span style={{marginLeft:6}}>{r.name}</span>
                </label>
              )
            })}
          </div>
          <button className="btn" style={{marginTop:10}} onClick={saveRoles}>Save Roles</button>
        </div>
      )}
    </div>
  )
}
