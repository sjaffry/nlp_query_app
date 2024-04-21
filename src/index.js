import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Ad_hoc_summary from './Ad_hoc_summary';
import Events_summary from './Events_summary';
import Create_event from './Create_event';
import Conversational_qna from './Conversational_qna';
import Court_checkins from './Court_checkins';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/Ad_hoc_summary" element={<Ad_hoc_summary />} />
        <Route path="/Events_summary" element={<Events_summary />} />
        <Route path="/Create_event" element={<Create_event />} />
        <Route path="/Conversational_qna" element={<Conversational_qna />} />
        <Route path="/Court_checkins" element={<Court_checkins />} />
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
