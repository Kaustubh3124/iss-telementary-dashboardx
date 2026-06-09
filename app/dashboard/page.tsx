import React from "react";
import type { Metadata } from "next";
import TelemetryDashboard from "./TelemetryDashboard";
import { Orbit } from "lucide-react";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "ISS Live Telemetry Dashboard | Orbital Command",
  description: "Real-time International Space Station telemetry tracking, coordinate logs, and flight statistics updated every 10 seconds.",
};

export default function DashboardPage() {
  return (
    <div className={styles.dashboardLayout}>
      <header className={`header-glass ${styles.header}`}>
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.logoGroup} id="dashboard-logo-group">
            <div className={styles.logoIconContainer}>
              <Orbit size={22} color="#3b82f6" />
            </div>
            <div>
              <h1 className={styles.headerTitle}>ORBITAL COMMAND</h1>
              <p className={styles.headerSubtitle}>ISS Mission Dashboard</p>
            </div>
          </div>
          <div className={styles.statusBadge} id="telemetry-uplink-status">
            <span className={`animate-pulse-glow ${styles.pulseDot}`}></span>
            <span className={styles.statusText}>Telemetry Uplink Active</span>
          </div>
        </div>
      </header>

      <main className={`container ${styles.mainContent}`}>
        <TelemetryDashboard />
      </main>

      <footer className="footer-glass">
        <div className="container">
          <p>© {new Date().getFullYear()} Orbital Command. ISS Telemetry data is fetched in real-time from Where The ISS At API.</p>
        </div>
      </footer>
    </div>
  );
}
