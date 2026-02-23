import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate(); 

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (form.username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }

    if (form.firstName.trim().length < 4) {
      setErrorMsg("First name must be at least 4 characters.");
      return;
    }

    if (form.lastName.trim().length < 4) {
      setErrorMsg("Last name must be at least 4 characters.");
      return;
    }

    try {
      await registerUser(form);
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);

      const message = String(err.message).toLowerCase();

      if (message.includes("rate limit")) {
        setErrorMsg("Too many registration attempts. Please try again later.");
      } else if (message.includes("user already registered")) {
        setErrorMsg("This email is already registered.");
      } else {
        setErrorMsg("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={onSubmit}>
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          required
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          required
        />

        <input
          name="username"
          minLength={3}
          value={form.username}
          onChange={onChange}
          placeholder="Username"
          required
        />

        <input
          name="firstName"
          minLength={4}
          value={form.firstName}
          onChange={onChange}
          placeholder="First name"
          required
        />

        <input
          name="lastName"
          minLength={4}
          value={form.lastName}
          onChange={onChange}
          placeholder="Last name"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}

export default Register;
