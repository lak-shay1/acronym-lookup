import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './Firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

function App() {
  const [acronyms, setAcronyms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch acronyms from Firestore when the component mounts
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

      {searchQuery.trim() !== '' ? (
        <AcronymList acronyms={acronyms} searchQuery={searchQuery} />
      ) : (
        <p className="AcronymList">
          Please enter a search query to view acronyms.
        </p>
      )}

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
    return acrUpper.startsWith(searchQuery.toUpperCase()); // Only match starting letters
  });

  if (filtered.length === 0) {
    return <p>No acronyms found.</p>;
  }

  return (
    <div className="AcronymList">
      <ul>
        {filtered.map(acr => (
          <li key={acr.id}>
            <strong>{acr.id}</strong>
            {acr.definition ? ` – ${acr.definition}` : ''}
            {acr.team ? ` (Team: ${acr.team})` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddAcronymForm({ onAcronymAdded }) {
  const [acronym, setAcronym] = useState('');
  const [definition, setDefinition] = useState('');
  const [team, setTeam] = useState(''); // New state for team name

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acronym.trim() || !definition.trim() || !team.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    const uppercaseAcronym = acronym.trim().toUpperCase();
    const definitionText = definition.trim();
    const teamText = team.trim();

    try {
      await setDoc(doc(db, 'acronyms', uppercaseAcronym), {
        definition: definitionText,
        team: teamText, // Store team name in Firebase
      });
      alert(`Acronym "${uppercaseAcronym}" added successfully!`);
      setAcronym('');
      setDefinition('');
      setTeam(''); // Reset team field
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
        <input
          type="text"
          placeholder="Team Name (e.g., DevOps)"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        <button type="submit">Add Acronym</button>
      </form>
    </div>
  );
}

export default App;
