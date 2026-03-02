import { useState } from "react";
import { decodeVin } from "../../services/vinService";

export default function VinCheck() {
  const [vin, setVin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);
    setLoading(true);

    if (vin.length !== 17) {
      setErrorMsg("VIN must be exactly 17 characters.");
      setLoading(false);
      return;
    }

    try {
      const data = await decodeVin(vin);
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || "Failed to decode VIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>VIN Check</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={vin}
          maxLength={17}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          placeholder="Enter 17-character VIN"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check VIN"}
        </button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Make:</strong> {result.make}</p>
          <p><strong>Model:</strong> {result.model}</p>
          <p><strong>Year:</strong> {result.year}</p>
          <p><strong>Body Class:</strong> {result.bodyClass}</p>
        </div>
      )}
    </div>
  );
}