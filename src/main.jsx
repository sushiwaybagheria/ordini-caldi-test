import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import OrdiniCaldi from './OrdiniCaldi'
import Storico from './Storico' // 👈 devi creare Storico.jsx


import OrdiniConCalendario from "./OrdiniConCalendario";









ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrdiniCaldi />} />
        <Route path="/Storico" element={<Storico />} />
<Route path="/" element={<OrdiniConCalendario />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
