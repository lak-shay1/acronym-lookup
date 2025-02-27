import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./Firebase";
import Dashboard from "./Dashboard";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { serverTimestamp } from "firebase/firestore"; // Import timestamp

function App() {
  const [acronyms, setAcronyms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Firestore real-time listener for acronyms
    const unsubscribe = onSnapshot(collection(db, "acronyms"), (snapshot) => {
      console.log("Acronyms updated:", snapshot.docs.map((doc) => doc.data())); // Debugging log
      const loaded = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setAcronyms(loaded);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <div className="container py-5">
      <h1 className="text-center text-primary mb-4">
        Broadband & Media Jargon Buster
      </h1>

      <SearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />

      {searchQuery.trim() !== "" ? (
        <AcronymList acronyms={acronyms} searchQuery={searchQuery} />
      ) : (
        <p className="text-center text-muted mt-3">
          Start typing to search for acronyms...
        </p>
      )}

      <AddAcronymForm />

      {/* Dashboard moved to the bottom */}
      <div className="mt-5 text-center">
        <Dashboard />
      </div>
    </div>
  );
}

function SearchBar({ searchQuery, onSearchQueryChange }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        className="form-control"
        placeholder="Search acronyms..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
    </div>
  );
}

function AcronymList({ acronyms, searchQuery }) {
  const filtered = acronyms.filter((item) =>
    item.id.toUpperCase().startsWith(searchQuery.toUpperCase())
  );

  if (filtered.length === 0) {
    return <p className="text-center text-danger">No acronyms found.</p>;
  }

  return (
    <div className="row mt-3">
      {filtered.map((acr) => (
        <div key={acr.id} className="col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title text-primary">{acr.id}</h5>
              <p className="card-text">{acr.definition}</p>
              {acr.team && <p className="text-muted">Team: {acr.team}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddAcronymForm() {
  const [acronym, setAcronym] = useState("");
  const [definition, setDefinition] = useState("");
  const [team, setTeam] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acronym.trim() || !definition.trim() || !team.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const uppercaseAcronym = acronym.trim().toUpperCase();
    const definitionText = definition.trim();
    const teamText = team.trim();

    try {
      await setDoc(doc(db, "acronyms", uppercaseAcronym), {
        definition: definitionText,
        team: teamText,
        createdAt: serverTimestamp(), // Add timestamp for sorting
      });
      alert(`Acronym "${uppercaseAcronym}" added successfully!`);
      setAcronym("");
      setDefinition("");
      setTeam("");
    } catch (error) {
      console.error("Error adding acronym:", error);
      alert("Failed to add acronym. See console for details.");
    }
  };

  return (
    <div className="card shadow-lg mt-5 p-4">
      <h3 className="text-center text-secondary mb-3">Add a New Acronym</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Acronym (e.g., API)"
            value={acronym}
            onChange={(e) => setAcronym(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Definition (e.g., Application Programming Interface)"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Team Name (e.g., DevOps)"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Add Acronym
        </button>
      </form>
    </div>
  );
}

export default App;


