import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [businessPermit, setBusinessPermit] = useState(null);
  const [password, setPassword] = useState("");
  const [recheckPassword, setRecheckPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecheckPassword, setShowRecheckPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paypal, setPaypal] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // Phone validation
    if (!/^(0\d{10}|\+63\d{10})$/.test(phone)) {
      alert("Phone number must start with 0 or +63 and be 11 digits long.");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters, include 1 uppercase letter and 1 number."
      );
      return;
    }

    if (password !== recheckPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Seller-specific validation
    if (role === "seller") {
      if (!businessPermit) {
        alert("Please upload your business permit (PDF).");
        return;
      }
      if (businessPermit.type !== "application/pdf") {
        alert("Business permit must be a PDF file.");
        return;
      }
      if (!paypal.trim()) {
        alert("Please enter your PayPal number.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", username.trim());
    formData.append("email", email.trim());
    formData.append("first_name", firstName.trim());
    formData.append("last_name", lastName.trim());
    formData.append("phone", phone.trim());
    formData.append("address", address.trim());
    formData.append("password", password.trim());
    formData.append("role", role === "customer" ? "Customer" : "Seller");

    if (role === "seller") {
      if (businessPermit) formData.append("businessPermit", businessPermit);
      formData.append("paypal", paypal.trim());
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/signup`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      // Save returned user data
      const userData = result.user;
      if (!userData || !userData.user_id) {
        throw new Error("Invalid response from server.");
      }

      // Redirect based on role
      if (role === "seller") {
        navigate(`/seller/home/${userData.user_id}`);
      } else {
        navigate(`/home/${userData.user_id}`);
      }
    } catch (error) {
      alert("Signup failed. " + error.message);
      console.error(error);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "recheckPassword") {
      setShowRecheckPassword(!showRecheckPassword);
    }
  };

  return (
    <main className={styles["signup-page"]}>
      <form className={styles["signup-form"]} onSubmit={handleSignup}>
        <h1 className={styles["signup-title"]}>Please fill up the form</h1>

        {/* Role Selection */}
        <fieldset className={styles["form-group"]}>
          <legend className={styles["form-label"]}>I am a:</legend>
          <div className={styles["radio-group"]}>
            <label className={styles["radio-label"]}>
              <input
                type="radio"
                name="role"
                value="customer"
                checked={role === "customer"}
                onChange={() => setRole("customer")}
                className={styles["radio-input"]}
              />
              Customer
            </label>
            <label className={styles["radio-label"]}>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={role === "seller"}
                onChange={() => setRole("seller")}
                className={styles["radio-input"]}
              />
              Seller
            </label>
          </div>
        </fieldset>

        {/* First + Last Name */}
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="first_name" className={styles["form-label"]}>
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              className={styles["form-input"]}
              placeholder="John"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className={styles["form-group"]}>
            <label htmlFor="last_name" className={styles["form-label"]}>
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              className={styles["form-input"]}
              placeholder="Doe"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="password" className={styles["form-label"]}>
              Password
            </label>
            <div className={styles["password-input-group"]}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={styles["form-input"]}
                placeholder="At least 8 characters, 1 uppercase, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className={styles["toggle-password-btn"]}
              >
                {showPassword ? "🔓" : "🔒"}
              </button>
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="recheckPassword" className={styles["form-label"]}>
              Re-enter Password
            </label>
            <div className={styles["password-input-group"]}>
              <input
                type={showRecheckPassword ? "text" : "password"}
                id="recheckPassword"
                className={styles["form-input"]}
                placeholder="Re-enter your password"
                value={recheckPassword}
                onChange={(e) => setRecheckPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("recheckPassword")}
                className={styles["toggle-password-btn"]}
              >
                {showRecheckPassword ? "🔓" : "🔒"}
              </button>
            </div>
          </div>
        </div>

      {/* Phone */}
          <div className={styles["form-group"]}>
            <label htmlFor="phone" className={styles["form-label"]}>
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              className={styles["form-input"]}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0917xxxxxxx or +63917xxxxxxx"
            />
        </div>

        {/* Address */}
        <div className={styles["form-group"]}>
          <label htmlFor="address" className={styles["form-label"]}>
            Address
          </label>
          <input
            type="text"
            id="address"
            className={styles["form-input"]}
            placeholder="Enter your full address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Seller Only Fields */}
        {role === "seller" && (
          <>
            <div className={styles["form-group"]}>
              <label htmlFor="paypal" className={styles["form-label"]}>
                PayPal Number
              </label>
              <input
                type="tel"
                id="paypal"
                className={styles["form-input"]}
                placeholder="Enter your PayPal number"
                required
                pattern="^(?:\+?\d{10,15}|0\d{9,14})$"
                title="Please enter a valid PayPal number (10–15 digits, may start with + or 0)."
                value={paypal}
                onChange={(e) => setPaypal(e.target.value)}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="businessPermit" className={styles["form-label"]}>
                Business Permit (PDF only)
              </label>
              <input
                type="file"
                id="businessPermit"
                className={styles["form-input"]}
                accept="application/pdf"
                onChange={(e) => setBusinessPermit(e.target.files[0])}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className={styles["submit-btn"]}>
          Submit
        </button>
      </form>
    </main>
  );
}
