import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './Firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

function App() {
  const [acronyms, setAcronyms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAcronyms() {
      const snapshot = await getDocs(collection(db, 'acronyms'));
      const loaded = [];
      snapshot.forEach(docSnap => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAcronyms(loaded);
    }
    fetchAcronyms();
  }, []);

  return (
    <div className="App">
      <h1>Acronym Lookup Tool</h1>

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <AcronymList
        acronyms={acronyms}
        searchQuery={searchQuery}
      />

      <AddAcronymForm
        onAcronymAdded={async () => {
          const snapshot = await getDocs(collection(db, 'acronyms'));
          const updated = [];
          snapshot.forEach(docSnap => {
            updated.push({ id: docSnap.id, ...docSnap.data() });
          });
          setAcronyms(updated);
        }}
      />
    </div>
  );
}

function SearchBar({ searchQuery, onSearchQueryChange }) {
  return (
    <div className="SearchBar">
      <input
        type="text"
        placeholder="Search acronyms..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
    </div>
  );
}

function AcronymList({ acronyms, searchQuery }) {
  const filtered = acronyms.filter(item => {
    const acrUpper = item.id.toUpperCase();
    const defLower = (item.definition || '').toLowerCase();
    return (
      acrUpper.includes(searchQuery.toUpperCase()) ||
      defLower.includes(searchQuery.toLowerCase())
    );
  });

  if (filtered.length === 0) {
    return <p className="AcronymList">No acronyms found.</p>;
  }

  return (
    <div className="AcronymList">
      <ul>
        {filtered.map(acr => (
          <li key={acr.id}>
            <strong>{acr.id}</strong>
            {acr.definition ? ` – ${acr.definition}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
      await setDoc(doc(db, 'acronyms', uppercaseAcronym), {
        definition: definitionText
      });
      alert(`Acronym "${uppercaseAcronym}" added successfully!`);
      setAcronym('');
      setDefinition('');
      onAcronymAdded();
    } catch (error) {
      console.error('Error adding acronym:', error);
      alert('Failed to add acronym. See console for details.');
    }
  };

  return (
    <div className="AddAcronymForm">
      <h3>Add a New Acronym</h3>
      <form onSubmit={handleSubmit}>
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
