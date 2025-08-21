import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Roles(){
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({ name:'', description:'' })

  async function load(){
    const r = await api.get('/roles'); setRoles(r.data)
  }
  useEffect(()=>{ load() }, [])

  async function createRole(e){
    e.preventDefault()
    await api.post('/roles', form)
    setForm({ name:'', description:'' })
    load()
  }

  async function removeRole(id){
    if(!confirm('Delete role?')) return
    await api.delete(`/roles/${id}`)
    load()
  }

  return (
    <div className="card">
      <h3>Roles</h3>
      <div className="grid" style={{marginTop:12}}>
        <div className="card">
          <b>Create Role</b>
          <form onSubmit={createRole}>
            <div>
              <label>Name</label>
              <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            </div>
            <div style={{marginTop:8}}>
              <label>Description</label>
              <input className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
            </div>
            <button className="btn" style={{marginTop:12}}>Create</button>
          </form>
        </div>
        <div className="card">
          <b>Role List</b>
          <table style={{marginTop:8}}>
            <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {roles.map(r=>(
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.description}</td>
                  <td>
                    <button className="btn" onClick={()=>removeRole(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
