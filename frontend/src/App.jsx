import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [total, setTotal] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            total: Number(total),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error");
      }

      setMessage("✅ Order created. Email will be sent asynchronously.");
      setEmail("");
      setTotal("");
    } catch (err) {
      setMessage("❌ Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🛒 Create Order</h2>

      <form onSubmit={submitOrder} style={styles.form}>
        <input
          type="email"
          placeholder="Customer email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Total amount"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Sending..." : "Create Order"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "Arial",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};

export default App;