"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Orbit, Lock, User, ArrowRight, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("iss_commander");
  const [password, setPassword] = useState("pass123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulated short delay for realistic auth feel
    setTimeout(() => {
      if (username.trim() === "" || password.trim() === "") {
        setError("Please fill in all telemetry access credentials.");
        setIsLoading(false);
        return;
      }

      // Mock successful login by setting a dummy JWT cookie
      // The cookie expires in 1 day (86400 seconds)
      document.cookie = "auth_token=mock-jwt-token-iss-telemetry-key-109283; path=/; max-age=86400; SameSite=Strict";

      // Direct page reload & route to trigger Next.js middleware update
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div style={styles.container}>
      {/* Stars Background Details */}
      <div style={styles.stars}></div>
      <div style={styles.stars2}></div>

      {/* Orbit Logo Element */}
      <div style={styles.orbitLogoContainer}>
        <div className="animate-spin-slow" style={styles.orbitRing}>
          <div style={styles.satelliteNode}></div>
        </div>
        <div style={styles.centerPlanet}>
          <Activity size={24} color="#60a5fa" />
        </div>
      </div>

      <div className="animate-slide-up" style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>ISS Telemetry Hub</h1>
          <p style={styles.subtitle}>Enter credentials to establish orbital uplink</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorContainer}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Command Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter access username"
                className="form-input"
                style={styles.inputIndent}
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Access Code</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                style={styles.inputIndent}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Establishing Connection...</span>
            ) : (
              <>
                <span>Establish Uplink</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footerNote}>
          <span style={styles.secureBadge}>
            <span
              style={styles.dot}
              className="animate-pulse-glow"
            ></span>
            Secured Telemetry Stream
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    padding: "2rem",
    position: "relative",
    background: "#080b11",
    overflow: "hidden",
  },
  stars: {
    position: "absolute",
    width: "1px",
    height: "1px",
    background: "transparent",
    boxShadow:
      "100px 300px #fff, 400px 100px #fff, 200px 400px #fff, 800px 200px #fff, 500px 600px #fff, 900px 800px #fff, 1200px 300px #fff, 1500px 700px #fff, 1100px 100px #fff, 700px 500px #fff",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  stars2: {
    position: "absolute",
    width: "2px",
    height: "2px",
    background: "transparent",
    boxShadow:
      "250px 150px #fff, 650px 350px #fff, 350px 750px #fff, 750px 550px #fff, 1050px 150px #fff, 1350px 450px #fff, 1450px 850px #fff, 150px 600px #fff",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  orbitLogoContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  orbitRing: {
    position: "absolute",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "1px dashed rgba(96, 165, 250, 0.4)",
  },
  satelliteNode: {
    position: "absolute",
    top: "12px",
    left: "12px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#60a5fa",
    boxShadow: "0 0 10px #3b82f6",
  },
  centerPlanet: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "rgba(13, 20, 37, 0.9)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
    zIndex: 2,
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "rgba(13, 20, 37, 0.7)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "1.25rem",
    padding: "2.5rem 2rem",
    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: "-0.025em",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.4",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "1rem",
    color: "#64748b",
    pointerEvents: "none",
  },
  inputIndent: {
    paddingLeft: "2.75rem",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    color: "#f8fafc",
  },
  submitBtn: {
    marginTop: "0.5rem",
    padding: "0.875rem",
    width: "100%",
  },
  footerNote: {
    marginTop: "2rem",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.75rem",
    color: "#64748b",
  },
  secureBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 6px #10b981",
    display: "inline-block",
  },
};
