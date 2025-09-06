import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Signup.module.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleUserData = location.state || {};
  
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
  const [fromGoogle, setFromGoogle] = useState(false);
  const [paypal, setPaypal] = useState("");  // Added back as it's optional but still used
  
  // Pre-fill form with Google data if available
  useEffect(() => {
    if (googleUserData.fromGoogle) {
      setFromGoogle(true);
      if (googleUserData.email) setEmail(googleUserData.email);
      if (googleUserData.firstName) setFirstName(googleUserData.firstName);
      if (googleUserData.lastName) setLastName(googleUserData.lastName);
      if (googleUserData.email) setUsername(googleUserData.email.split('@')[0]);
    } else if (googleUserData.user) {
      // Handle data from Google OAuth redirect
      setFromGoogle(true);
      if (googleUserData.user.email) setEmail(googleUserData.user.email);
      if (googleUserData.user.First_name) setFirstName(googleUserData.user.First_name);
      if (googleUserData.user.Last_name) setLastName(googleUserData.user.Last_name);
      if (googleUserData.user.email) setUsername(googleUserData.user.email.split('@')[0]);
    }
  }, [googleUserData]);

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    console.log("Form submission started");

    // Create a flag to track validation status
    let isFormValid = true;

    // Basic validation
    if (!username.trim()) {
      alert("Username is required.");
      console.log("Missing field: username");
      console.log("Alert shown: Username is required.");
      isFormValid = false;
      return;
    }
    // Email validation removed as requested
    if (!firstName.trim()) {
      alert("First name is required.");
      console.log("Missing field: firstName");
      isFormValid = false;
      return;
    }
    if (!lastName.trim()) {
      alert("Last name is required.");
      console.log("Missing field: lastName");
      isFormValid = false;
      return;
    }
    if (!phone.trim()) {
      alert("Phone number is required.");
      console.log("Missing field: phone");
      isFormValid = false;
      return;
    }
    if (!address.trim()) {
      alert("Address is required.");
      console.log("Missing field: address");
      isFormValid = false;
      return;
    }
    console.log("All required fields are filled");

    // Phone validation
    if (!/^(09\d{9})$/.test(phone)) {
      alert("Phone number must start with 09 and be 11 digits long.");
      console.log("Phone validation failed:", phone);
      isFormValid = false;
      return;
    }
    
    // Email validation removed as requested

    // Password validation - skip for Google users
    if (!fromGoogle) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        alert(
          "Password must be at least 8 characters, include 1 uppercase letter and 1 number."
        );
        console.log("Password validation failed: Password doesn't meet requirements");
        isFormValid = false;
        return;
      }

      if (password !== recheckPassword) {
        alert("Passwords do not match.");
        console.log("Password validation failed: Passwords don't match");
        isFormValid = false;
        return;
      }
      console.log("Password validation passed");
    } else {
      console.log("Google user - skipping password validation");
    }

    // Seller-specific validation
    if (role === "seller") {
      if (!businessPermit) {
        alert("Please upload your business permit (PDF or image).");
        console.log("Missing business permit for seller");
        isFormValid = false;
        return;
      }
      if (!businessPermit.type.startsWith('image/') && businessPermit.type !== "application/pdf") {
        alert("Business permit must be a PDF or image file.");
        console.log("Invalid business permit type:", businessPermit.type);
        isFormValid = false;
        return;
      }
      // PayPal validation removed as requested
      // Log business permit details for debugging
      console.log("Business permit:", businessPermit.name, businessPermit.type, businessPermit.size);
      console.log("Seller validation passed");
    }
    
    // If validation fails, don't proceed
    if (!isFormValid) {
      console.log("Form validation failed");
      return;
    }

    const formData = new FormData();
    // Ensure username is not empty
    if (!username.trim()) {
      alert("Username is required.");
      return;
    }
    formData.append("username", username.trim());
    formData.append("email", email.trim());
    formData.append("first_name", firstName.trim());
    formData.append("last_name", lastName.trim());
    formData.append("phone", phone.trim());
    formData.append("address", address.trim());
    
    // Only append password for non-Google users
    if (!fromGoogle) {
      formData.append("password", password.trim());
    } else {
      // For Google users, send a flag and the Google user ID if available
      formData.append("fromGoogle", "true");
      
      // Handle both cases: redirected from login or from Google OAuth
      if (googleUserData.user) {
        if (googleUserData.user.user_id) {
          formData.append("googleUserId", googleUserData.user.user_id);
        }
        if (googleUserData.user.googleId) {
          formData.append("googleId", googleUserData.user.googleId);
        }
      }
    }
    
    // Ensure role is properly capitalized for the backend
    const formattedRole = role === "customer" ? "Customer" : "Seller";
    formData.append("role", formattedRole);
    console.log("Role being sent:", formattedRole);

    if (role === "seller") {
      if (businessPermit) {
        // Ensure the file is properly appended with the correct field name
        // Log the business permit file details to debug
        console.log("Business permit file:", businessPermit);
        console.log("Business permit file type:", businessPermit.type);
        console.log("Business permit file name:", businessPermit.name);
        console.log("Business permit file size:", businessPermit.size);
        
        formData.append("businessPermit", businessPermit, businessPermit.name);
        console.log("Appending business permit to form data:", businessPermit.name);
      }
      // PayPal is optional in the backend
      if (paypal && paypal.trim()) {
        formData.append("paypal", paypal.trim());
        console.log("Appending paypal to form data:", paypal.trim());
      }
    }

    try {
      // Log form data for debugging
      console.log("Form data entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const apiUrl = import.meta.env.VITE_API_URL || "";
      console.log("Sending request to:", `${apiUrl}/api/signup`);
      // Log form data for debugging
      console.log("Form data being sent:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch(`${apiUrl}/api/signup`, {
        method: "POST",
        body: formData,
      });
      
      console.log("Response status:", response.status);
      console.log("Response content type:", response.headers.get('content-type'));
      
      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log("Response data (JSON):", result);
      } else {
        // Handle non-JSON response (like HTML)
        const textResult = await response.text();
        console.log("Response data (text):", textResult);
        throw new Error("Server returned non-JSON response. Please try again or contact support.");
      }

      if (!response.ok) {
        console.error("Signup error:", result);
        throw new Error(result.message || "Signup failed");
      }

      // Save returned user data
      const userData = result.user;
      if (!userData || !userData.user_id) {
        throw new Error("Invalid response from server.");
      }

      // Redirect based on role and approval status
      if (role === "seller") {
        // For sellers, show a message that their application is pending approval
        alert("Your seller application has been submitted and is pending admin approval. You will be notified once approved.");
        navigate(`/login`);
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

  // Add a direct submit handler function
  const submitForm = () => {
    console.log("Manual form submission");
    console.log("Current form values:", {
      username,
      email,
      firstName,
      lastName,
      phone,
      address,
      role,
      paypal: role === "seller" ? (paypal ? paypal : "Not provided (optional)") : "N/A",
      businessPermit: role === "seller" ? (businessPermit ? "Uploaded" : "Not uploaded") : "N/A"
    });
    
    // Clear any previous validation errors
    let isValid = true;
    
    // Check all fields manually
    if (!username.trim()) {
      console.log("Validation failed: Username is required");
      alert("Username is required");
      isValid = false;
      return;
    }
    console.log("Username validation passed");
    
    // Email validation
    if (!email.trim()) {
      console.log("Validation failed: Email is required");
      alert("Email is required");
      isValid = false;
      return;
    }
    
    // Validate email format
    const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailPattern.test(email)) {
      console.log("Validation failed: Invalid email format");
      alert("Please enter a valid email address");
      isValid = false;
      return;
    }
    console.log("Email validation passed");
    
    if (!firstName.trim()) {
      console.log("Validation failed: First name is required");
      alert("First name is required");
      isValid = false;
      return;
    }
    console.log("First name validation passed");
    
    if (!lastName.trim()) {
      console.log("Validation failed: Last name is required");
      alert("Last name is required");
      isValid = false;
      return;
    }
    console.log("Last name validation passed");
    
    if (!phone.trim()) {
      console.log("Validation failed: Phone number is required");
      alert("Phone number is required");
      isValid = false;
      return;
    }
    console.log("Phone validation passed");
    
    if (!address.trim()) {
      console.log("Validation failed: Address is required");
      alert("Address is required");
      isValid = false;
      return;
    }
    console.log("Address validation passed");
    
    // Validate phone number format
    if (!/^(09\d{9})$/.test(phone)) {
      console.log("Validation failed: Invalid phone number format");
      alert("Phone number must start with 09 and be 11 digits long.");
      isValid = false;
      return;
    }
    console.log("Phone format validation passed");
    
    // For sellers, check additional fields
    if (role === "seller") {
      console.log("Validating seller-specific fields");
      if (!businessPermit) {
        console.log("Validation failed: Business permit is required");
        alert("Business permit is required");
        isValid = false;
        return;
      }
      console.log("Business permit validation passed");
      
      // PayPal validation removed as it's optional in the backend
    }
    
    console.log("All fields validated manually - SUCCESS");
    
    // Only proceed if all validations passed
    if (isValid) {
      console.log("All validations passed, proceeding with form submission");
      // Call the actual form submission function
      handleSignup(new Event('submit'));
    } else {
      console.log("Validation failed, form not submitted");
      alert("Signup failed. All required fields must be filled.");
    }
  };
  
  return (
    <main className={styles["signup-page"]}>
      <form className={styles["signup-form"]} onSubmit={(e) => {
          console.log("Form submitted");
          handleSignup(e);
        }}>
        <h1 className={styles["signup-title"]}>
          {fromGoogle ? "Complete your profile" : "Please fill up the form"}
        </h1>
        
        {fromGoogle && (
          <div className={styles["google-info"]}>
            <p>You're signing up with Google. Please complete your profile information.</p>
          </div>
        )}

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

        {/* Username */}
        <div className={styles["form-group"]}>
          <label htmlFor="username" className={styles["form-label"]}>
            Username
          </label>
          <input
            type="text"
            id="username"
            className={styles["form-input"]}
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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

        {/* Email */}
        <div className={styles["form-group"]}>
          <label htmlFor="email" className={styles["form-label"]}>
            Email
          </label>
          <input
            type="email"
            id="email"
            className={styles["form-input"]}
            placeholder="Enter your email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Please enter a valid email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password + Confirm - Only show for non-Google users */}
        {!fromGoogle && (
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
                  required={!fromGoogle}
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
                  required={!fromGoogle}
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
        )}

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
              pattern="^(09\d{9})$"
              title="Phone number must start with 09 and be 11 digits long."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
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
                PayPal Number (Optional)
              </label>
              <input
                type="text"
                id="paypal"
                className={styles["form-input"]}
                placeholder="11-digit PayPal number (optional)"
                pattern="^\d{11}$"
                title="PayPal number should be 11 digits (optional)"
                value={paypal}
                onChange={(e) => setPaypal(e.target.value)}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="businessPermit" className={styles["form-label"]}>
                Business Permit (PDF or Image)
              </label>
              <input
                type="file"
                id="businessPermit"
                className={styles["form-input"]}
                accept="application/pdf,image/*"
                onChange={(e) => setBusinessPermit(e.target.files[0])}
                required
              />
            </div>
          </>
        )}

        <button 
          type="button" 
          className={styles["submit-btn"]}
          onClick={(e) => {
            e.preventDefault();
            console.log("Submit button clicked manually");
            submitForm();
          }}
        >
          Submit
        </button>
      </form>
    </main>
  );
}
