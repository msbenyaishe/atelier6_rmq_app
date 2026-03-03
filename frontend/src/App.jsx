import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [email, setEmail] = useState("");
  const [total, setTotal] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, total: Number(total) }),
    });

    const data = await res.json();
    setMsg(data.message || "Order sent");
  };

  return (
    <form onSubmit={submit}>
      <h2>Create Order</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={total} onChange={(e) => setTotal(e.target.value)} />
      <button>Create</button>
      <p>{msg}</p>
    </form>
  );
}

export default App;