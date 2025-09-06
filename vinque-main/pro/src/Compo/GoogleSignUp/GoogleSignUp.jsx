import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import styles from "./GoogleSignUp.module.css";

export default function GoogleSignUp() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/google-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        const user = data.user;
        
        // Always redirect new Google users to the signup form
        if (data.isNewUser) {
          console.log("Redirecting new Google user to signup form", user);
          // Redirect to the sign-up form with Google user data
          navigate("/signup", {
            state: { 
              user,
              fromGoogle: true
            }
          });
          return;
        }

        if (data.requiresOTP) {
          navigate("/otp-verification", {
            state: { user, isNewUser: data.isNewUser || false },
          });
        } else {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userId", user.user_id.toString());
          localStorage.setItem("history_id", user.history_id);
          localStorage.setItem("first_name", user.First_name);
          localStorage.setItem("last_name", user.Last_name);

          if (user.customer_id) {
            localStorage.setItem("customer_id", user.customer_id.toString());
          }

          if (user.seller_id) {
            localStorage.setItem("seller_id", user.seller_id.toString());
          }

          if (user.role === "Seller") {
            if (user.seller_id) {
              navigate(`/seller/home/${user.seller_id}`);
            } else {
              // Handle pending seller approval case
              alert("Your seller account is pending approval. Please wait for admin approval before accessing seller features.");
              navigate("/login");
            }
          } else {
            navigate(`/home/${user.customer_id}`);
          }
        }
      } else {
        console.error("Google sign-up failed:", data.message);
        alert("Sign-up failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      alert("Sign-up failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.error("Google sign-up failed");
    alert("Google sign-up failed. Please try again.");
  };

  return (
    <div className={styles.googleSignUpWrapper}>
      <div className={styles.googleBtnContainer}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          text="signin_with"
          shape="rectangular"
          locale="en"
          width="300px"
          logo_alignment="center"
        />
      </div>
    </div>
  );
}
