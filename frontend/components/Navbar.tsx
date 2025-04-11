"use client";

import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import RecipeSidebar, { Recipe } from "./RecipeSidebar";

interface NavbarProps {
  user: User;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function Navbar({ user, onSelectRecipe }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSelectAndClose = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    setMobileMenuOpen(false);
  };

  const photoURL = user.photoURL || "/default-avatar.png";

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">PicMeal</div>
        <div className="navbar-desktop">
          <span className="navbar-username">
            Howdy, Chef{" "}
            {(user.displayName && user.displayName.split(" ")[0]) || "Spidey"}!
          </span>
          <img src={photoURL} alt="User Avatar" className="navbar-avatar" />
          <button onClick={handleLogout} className="navbar-logout">
            Logout
          </button>
        </div>
        <div className="navbar-mobile">
          <button onClick={toggleMobileMenu} className="hamburger-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="hamburger-icon"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="mobile-sidebar-overlay">
          <div className="mobile-sidebar">
            <button onClick={toggleMobileMenu} className="mobile-close-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mobile-close-icon"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <br />
            <br />
            <RecipeSidebar onSelectRecipe={handleSelectAndClose} />
            <br />
            <br />
            <hr />
            <div className="hamburger-user-det">
              <img src={photoURL} alt="User Avatar" className="navbar-avatar" />
              <span className="navbar-username">
                Howdy, Chef{" "}
                {(user.displayName && user.displayName.split(" ")[0]) ||
                  "Spidey"}
                !
              </span>
            </div>
            <button onClick={handleLogout} className="mobile-logout-btn">
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
