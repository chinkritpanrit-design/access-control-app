import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Requests(){
  const [roles, setRoles] = useState([])
  const [list, setList] = useState([])
  const [roleId, setRoleId] = useState('')
  const [reason, setReason] = useState('')

  async function load(){
    const [r, l] = await Promise.all([api.get('/roles'), api.get('/requests')])
    setRoles(r.data); setList(l.data)
  }
  useEffect(()=>{ load() }, [])

  async function submit(e){
    e.preventDefault()
    if(!roleId) return alert('Pick a role')
    await api.post('/requests', { role_id: Number(roleId), reason })
    setRoleId(''); setReason('')
    load()
  }

  async function act(id, action){
    await api.post(`/requests/${id}/${action}`)
    load()
  }

  function isAdminView(row){
    return row.user_email !== undefined
  }

  return (
    <div className="card">
      <h3>Access Requests</h3>
      <div className="grid" style={{marginTop:12}}>
        <div className="card">
          <b>Request a Role</b>
          <form onSubmit={submit}>
            <div>
              <label>Role</label>
              <select className="input" value={roleId} onChange={e=>setRoleId(e.target.value)}>
                <option value="">-- select --</option>
                {roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={{marginTop:8}}>
              <label>Reason</label>
              <input className="input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why do you need this role?"/>
            </div>
            <button className="btn" style={{marginTop:12}}>Submit</button>
          </form>
        </div>
        <div className="card">
          <b>Requests</b>
          <table style={{marginTop:8}}>
            <thead><tr>
              {list[0]?.user_email !== undefined ? <th>Requester</th> : null}
              <th>Role</th><th>Status</th><th>Reason</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {list.map(r=>(
                <tr key={r.id}>
                  {isAdminView(r) ? <td>{r.user_email}</td> : null}
                  <td>{r.role_name}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td className="muted">{r.reason}</td>
                  <td>
                    {isAdminView(r) && r.status==='PENDING' && (
                      <>
                        <button className="btn" onClick={()=>act(r.id,'approve')}>Approve</button>
                        <button className="btn" style={{marginLeft:6}} onClick={()=>act(r.id,'deny')}>Deny</button>
                      </>
                    )}
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
