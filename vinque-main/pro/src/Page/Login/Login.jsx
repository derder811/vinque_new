// Login.jsx
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import GoogleSignUp from "../../Compo/GoogleSignUp/GoogleSignUp";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className={styles["login-page"]}>
      <div className={styles["login-form"]}>
        <h1 className={styles["welcome-title"]}>WELCOME TO VINQUE</h1>
        <h2 className={styles["form-title"]}>Sign In</h2>
        
        <p className={styles["sign-in-text"]}>Sign in with your Google account to continue</p>
        
        <div className={styles["google-login-container"]}>
          <GoogleSignUp />
        </div>
        
        <div className={styles["terms-text"]}>
          By signing in, you agree to our <span className={styles["terms-link"]}>Terms of Service</span> and <span className={styles["terms-link"]}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
