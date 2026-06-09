"use client";

import React, { useState } from "react";
import { Orbit, Lock, User, ArrowRight, Activity } from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("iss_commander");
  const [password, setPassword] = useState("pass123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (!username.trim() || !password.trim()) {
        setError("Please enter your command credentials.");
        setIsLoading(false);
        return;
      }

      document.cookie = "auth_token=mock-jwt-token-iss-telemetry-key-109283; path=/; max-age=86400; SameSite=Strict";
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div className={styles.container}>
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>

      <div className={styles.orbitLogoContainer}>
        <div className={`animate-spin-slow ${styles.orbitRing}`}>
          <div className={styles.satelliteNode}></div>
        </div>
        <div className={styles.centerPlanet}>
          <Activity size={24} color="#60a5fa" />
        </div>
      </div>

      <div className={`animate-slide-up ${styles.card}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>ISS Telemetry Hub</h1>
          <p className={styles.subtitle}>Enter credentials to establish orbital uplink</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorContainer}>{error}</div>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Command Username</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter access username"
                className={`form-input ${styles.inputIndent}`}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Access Code</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`form-input ${styles.inputIndent}`}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <span>Establish Uplink</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footerNote}>
          <span className={styles.secureBadge}>
            <span className={`animate-pulse-glow ${styles.dot}`}></span>
            Secured Telemetry Stream
          </span>
        </div>
      </div>
    </div>
  );
}
