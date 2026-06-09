import React from "react";
import type { Metadata } from "next";
import TelemetryDashboard from "./TelemetryDashboard";
import { Orbit } from "lucide-react";

export const metadata: Metadata = {
  title: "ISS Live Telemetry Dashboard | Orbital Command",
  description: "Real-time International Space Station telemetry tracking, coordinate logs, and flight statistics updated every 10 seconds.",
};

export default function DashboardPage() {
  return (
    <div style={styles.dashboardLayout}>
      {/* Header (Server Component Rendered) */}
      <header className="header-glass" style={styles.header}>
        <div className="container" style={styles.headerContainer}>
          <div style={styles.logoGroup} id="dashboard-logo-group">
            <div style={styles.logoIconContainer}>
              <Orbit size={22} color="#3b82f6" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>ORBITAL COMMAND</h1>
              <p style={styles.headerSubtitle}>ISS Mission Dashboard</p>
            </div>
          </div>
          <div style={styles.statusBadge} id="telemetry-uplink-status">
            <span style={styles.pulseDot} className="animate-pulse-glow"></span>
            <span style={styles.statusText}>Telemetry Uplink Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={styles.mainContent}>
        <TelemetryDashboard />
      </main>

      {/* Footer */}
      <footer className="footer-glass">
        <div className="container">
          <p>© {new Date().getFullYear()} Orbital Command. ISS Telemetry data is fetched in real-time from Where The ISS At API.</p>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardLayout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
  },
  header: {
    padding: "1rem 0",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logoIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "0.75rem",
    background: "var(--primary-light)",
    border: "1px solid var(--card-border)",
  },
  headerTitle: {
    fontSize: "1.125rem",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "var(--text-primary)",
    lineHeight: "1.2",
  },
  headerSubtitle: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
    fontWeight: "500",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.375rem 0.75rem",
    borderRadius: "9999px",
    background: "var(--accent-light)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--accent)",
    boxShadow: "0 0 8px var(--accent)",
  },
  statusText: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--accent)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  mainContent: {
    paddingTop: "2.5rem",
    paddingBottom: "4rem",
    flex: 1,
  },
};
