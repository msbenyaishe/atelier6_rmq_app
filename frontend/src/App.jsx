import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [email, setEmail] = useState("");
  const [total, setTotal] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, total: Number(total) }),
      });

      if (!res.ok) {
        throw new Error(`Order creation failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setMsg(data.message || "Order sent successfully");
      setEmail("");
      setTotal("");
    } catch (error) {
      console.error("Error:", error);
      setMsg(`Error: ${error.message || "Failed to create order. Please try again."}`);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <div className="card-header">
          <h2>Create Order</h2>
          <p className="subtitle">Fill the details below to create a new order</p>
        </div>

        <form onSubmit={submit} className="form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Total Amount</label>
            <input
              type="number"
              placeholder="Enter total amount"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            Create Order
          </button>

          {msg && (
            <p className={`message ${msg.startsWith("Error") ? "error" : "success"}`}>
              {msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;