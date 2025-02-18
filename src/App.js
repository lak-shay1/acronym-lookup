// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './Firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';

function App() {
  const [acronyms, setAcronyms] = useState([]); // holds acronyms from Firestore
  const [searchQuery, setSearchQuery] = useState(''); // holds the search input

  // Function to fetch acronyms from Firestore
  const fetchAcronyms = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'acronyms'));
      const loaded = [];
      snapshot.forEach(docSnap => {
        loaded.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setAcronyms(loaded);
    } catch (err) {
      console.error('Error fetching acronyms:', err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchAcronyms();
  }, []);

  return (
    <div className="App" style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h1>Acronym Lookup Tool</h1>
      
      <SearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />

      <AcronymList acronyms={acronyms} searchQuery={searchQuery} />

      <AddAcronymForm onAcronymAdded={fetchAcronyms} />
    </div>
  );
}

// ----- SearchBar Component -----
function SearchBar({ searchQuery, onSearchQueryChange }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Search acronyms..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        style={{ width: '100%', padding: '8px' }}
      />
    </div>
  );
}

// ----- AcronymList Component -----
function AcronymList({ acronyms, searchQuery }) {
  // Filter acronyms based on the search query
  const filtered = acronyms.filter(item => {
    const acrUpper = item.id.toUpperCase();
    const defLower = (item.definition || '').toLowerCase();
    return (
      acrUpper.includes(searchQuery.toUpperCase()) ||
      defLower.includes(searchQuery.toLowerCase())
    );
  });

  if (filtered.length === 0) {
    return <p>No acronyms found.</p>;
  }

  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {filtered.map(item => (
        <li key={item.id} style={{ margin: '0.5rem 0' }}>
          <strong>{item.id}</strong> – {item.definition}
        </li>
      ))}
    </ul>
  );
}

// ----- AddAcronymForm Component -----
function AddAcronymForm({ onAcronymAdded }) {
  const [acronym, setAcronym] = useState('');
  const [definition, setDefinition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acronym.trim() || !definition.trim()) {
      alert('Please fill in both fields.');
      return;
    }

    const uppercaseAcronym = acronym.trim().toUpperCase();
    const definitionText = definition.trim();

    try {
      // Create or overwrite document in the "acronyms" collection with the acronym as the document ID
      await setDoc(doc(db, 'acronyms', uppercaseAcronym), {
        definition: definitionText
      });
      alert(`Acronym "${uppercaseAcronym}" added successfully!`);

      // Clear the form fields
      setAcronym('');
      setDefinition('');

      // Notify parent to re-fetch the updated acronym list
      onAcronymAdded();
    } catch (error) {
      console.error('Error adding acronym:', error);
      alert('Failed to add acronym. See console for details.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Add a New Acronym</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Acronym (e.g., API)"
          value={acronym}
          onChange={(e) => setAcronym(e.target.value)}
        />
        <input
          type="text"
          placeholder="Definition (e.g., Application Programming Interface)"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
        />
        <button type="submit">Add Acronym</button>
      </form>
    </div>
  );
}

export default App;
