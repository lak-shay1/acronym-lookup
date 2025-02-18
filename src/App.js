import React, { useState, useEffect } from 'react';
import { db } from './Firebase';                 // Our Firestore reference
import {
  collection,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Acronym Lookup Tool</h1>
      <p>This is a clean slate.</p>
    </div>
  );
}

export default App;
