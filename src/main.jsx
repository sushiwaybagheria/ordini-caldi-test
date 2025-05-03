import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'




import OrdiniConCalendario from "./OrdiniConCalendario";

import Storico from './Storico' // 👈 devi creare Storico.jsx







ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
       
    
<Route path="/" element={<OrdiniConCalendario />} />
    <Route path="/Storico" element={<Storico />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
