import { useState } from 'react';

export default function App() {
  const [response, setResponse] = useState(null);

  const fetchCatalog = async () => {
    const data = await fetch('http://localhost:5000/api/catalog').then(r => r.json());
    console.log(data);
    setResponse(data);
  };

  const fetchUser = async () => {
    const data = await fetch('http://localhost:5000/api/user').then(r => r.json());
    console.log(data);
    setResponse(data);
  };

  const fetchEngine = async () => {
    const data = await fetch('http://localhost:5000/api/engine').then(r => r.json());
    console.log(data);
    setResponse(data);
  };

  return (
    <div>
      <h1>Smoke Test</h1>
      <button onClick={fetchCatalog}>Catalog</button>
      <button onClick={fetchUser}>User</button>
      <button onClick={fetchEngine}>Engine</button>
      {response && <p>{JSON.stringify(response)}</p>}
    </div>
  );
}