"use client";

import React from "react";
import { auth } from "../../firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <>
      <main className="login-main">
        <h1 className="login-title">Welcome to PicMeal</h1>
        <button onClick={handleLogin} className="login-button">
          Login with Google
        </button>
        <br />
        <br />
        <footer className="footer">
          <p>
            Developed by -{" "}
            <a href="https://preyashyadav.com" className="footer-link">
              Preyash Yadav
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
