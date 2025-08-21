import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function ProtectedRoute({children}){
  const [ok, setOk] = useState(false)
  const nav = useNavigate()

  useEffect(()=>{
    const t = localStorage.getItem('token')
    if (!t) { nav('/login'); return }
    api.get('/me').then(()=> setOk(true)).catch(()=>{
      localStorage.removeItem('token'); nav('/login')
    })
  }, [])

  if (!ok) return <div className="container"><div className="card"><p>Checking session…</p></div></div>
  return children
}
