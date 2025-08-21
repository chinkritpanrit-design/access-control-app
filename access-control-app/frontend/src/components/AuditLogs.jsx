import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function AuditLogs(){
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  useEffect(()=>{
    api.get('/audit-logs').then(r=> setRows(r.data)).catch(e=> setErr(e?.response?.data?.error || 'Failed to load'))
  }, [])

  return (
    <div className="card">
      <h3>Audit Logs</h3>
      {err && <p style={{color:'#fca5a5'}}>{err}</p>}
      <table style={{marginTop:8}}>
        <thead><tr><th>ID</th><th>User</th><th>Action</th><th>Details</th><th>At</th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.user_email || '-'}</td>
              <td>{r.action}</td>
              <td className="muted">{r.details}</td>
              <td>{r.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
