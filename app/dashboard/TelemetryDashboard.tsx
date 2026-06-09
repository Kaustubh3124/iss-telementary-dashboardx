"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Map,
  Database
} from "lucide-react";

interface TelemetryRecord {
  id: number;
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
}

export default function TelemetryDashboard() {
  const [history, setHistory] = useState<TelemetryRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<TelemetryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMapVisible, setIsMapVisible] = useState(true);

  const recordsPerPage = 10;

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Telemetry Fetcher
  const fetchTelemetry = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await axios.get("https://api.wheretheiss.at/v1/satellites/25544");
      const data = response.data;
      
      const newRecord: TelemetryRecord = {
        id: Date.now(), // Unique ID for client key rendering
        timestamp: data.timestamp,
        latitude: parseFloat(data.latitude.toFixed(4)),
        longitude: parseFloat(data.longitude.toFixed(4)),
        altitude: parseFloat(data.altitude.toFixed(2)),
        velocity: parseFloat(data.velocity.toFixed(2)),
        visibility: data.visibility
      };

      setCurrentRecord(newRecord);
      setHistory((prev) => {
        // Only append if it's a new timestamp to prevent duplicates on manual refresh
        if (prev.some((r) => r.timestamp === newRecord.timestamp)) {
          return prev;
        }
        return [...prev, newRecord];
      });
      setError(null);
    } catch (err: any) {
      console.error("Uplink error:", err);
      setError("Unable to sync telemetry. Retrying connection...");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Interval Setup & Teardown
  useEffect(() => {
    // Initial load
    fetchTelemetry();

    // 10 second polling
    const timer = setInterval(() => {
      fetchTelemetry();
    }, 10000);

    // Teardown listener to prevent leaks
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Logout Handler
  const handleLogout = () => {
    // Clear authorization token cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to login page, fully resetting memory and intervals
    window.location.href = "/login";
  };

  // Pagination Logic
  // Show newer records first in the table
  const sortedHistory = [...history].reverse();
  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / recordsPerPage));
  
  // Guard current page boundaries
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedHistory.slice(indexOfFirstRecord, indexOfLastRecord);

  // Format Unix Timestamp
  const formatTime = (unixSecs: number) => {
    const date = new Date(unixSecs * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  const formatDate = (unixSecs: number) => {
    const date = new Date(unixSecs * 1000);
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  // SVG Orbit Map calculations
  // Map longitude (-180 to 180) to X (10% to 90% of SVG viewport)
  // Map latitude (-90 to 90) to Y (90% to 10% of SVG viewport)
  const mapCoordinates = (lat: number, lon: number) => {
    const w = 800;
    const h = 400;
    const paddingX = 40;
    const paddingY = 20;

    const x = paddingX + ((lon + 180) / 360) * (w - 2 * paddingX);
    const y = paddingY + ((90 - lat) / 180) * (h - 2 * paddingY);
    return { x, y };
  };

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in" id="telemetry-dashboard-container">
      {/* Control Actions Strip */}
      <div style={styles.controlStrip}>
        <div style={styles.controlGroup}>
          <button
            onClick={() => fetchTelemetry(true)}
            className="btn-secondary"
            disabled={isRefreshing || isLoading}
            style={styles.controlBtn}
            title="Force telemetry refresh"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Syncing..." : "Sync Now"}</span>
          </button>
          <button
            onClick={() => setIsMapVisible(!isMapVisible)}
            className="btn-secondary"
            style={styles.controlBtn}
            title="Toggle Orbital Map"
          >
            <Map size={16} />
            <span>{isMapVisible ? "Hide Map" : "Show Map"}</span>
          </button>
        </div>

        <div style={styles.controlGroup}>
          <button
            onClick={toggleDarkMode}
            className="btn-secondary"
            style={styles.themeToggleBtn}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} color="#facc15" /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={handleLogout}
            className="btn-danger"
            style={styles.logoutBtn}
            id="btn-logout"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* Network Alert Notification */}
      {error && (
        <div style={styles.errorBanner} className="animate-slide-up">
          <Activity size={18} style={styles.pulseIcon} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Stats Cards Grid */}
      <div style={styles.statsGrid}>
        {/* Card: Position (Lat/Lon) */}
        <div className="glass-card" style={styles.statCard} id="card-position">
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Coordinates</span>
            <Compass size={20} color="var(--primary)" />
          </div>
          <div style={styles.cardValue}>
            {isLoading ? (
              <span style={styles.skeletonText}>Loading...</span>
            ) : (
              <>
                <span style={styles.coordinateText}>{currentRecord?.latitude}° N</span>
                <span style={styles.coordinateSeparator}>,</span>
                <span style={styles.coordinateText}>{currentRecord?.longitude}° E</span>
              </>
            )}
          </div>
          <div style={styles.cardFooter}>
            <span style={styles.badge} className="badge-primary">
              Position Vector
            </span>
          </div>
        </div>

        {/* Card: Altitude */}
        <div className="glass-card" style={styles.statCard} id="card-altitude">
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Altitude</span>
            <ArrowUpRight size={20} color="var(--accent)" />
          </div>
          <div style={styles.cardValue}>
            {isLoading ? (
              <span style={styles.skeletonText}>Loading...</span>
            ) : (
              <span>{currentRecord?.altitude?.toLocaleString()} km</span>
            )}
          </div>
          <div style={styles.cardFooter}>
            <span style={styles.badge} className="badge-success">
              Orbital height
            </span>
          </div>
        </div>

        {/* Card: Velocity */}
        <div className="glass-card" style={styles.statCard} id="card-velocity">
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Velocity</span>
            <TrendingUp size={20} color="var(--danger)" />
          </div>
          <div style={styles.cardValue}>
            {isLoading ? (
              <span style={styles.skeletonText}>Loading...</span>
            ) : (
              <span>{currentRecord?.velocity?.toLocaleString()} km/h</span>
            )}
          </div>
          <div style={styles.cardFooter}>
            <span style={styles.badge} className="badge-danger">
              Hypersonic flight
            </span>
          </div>
        </div>
      </div>

      {/* Orbital Visualization Map */}
      {isMapVisible && (
        <div className="glass-card animate-slide-up" style={styles.mapCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionHeaderTitle}>
              <Map size={18} color="var(--primary)" />
              <h2>Orbital Track Projection</h2>
            </div>
            <span style={styles.historyCounter}>
              Plotting {history.length} point{history.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={styles.mapContainer}>
            <svg
              viewBox="0 0 800 400"
              style={styles.mapSvg}
              id="orbital-path-svg"
            >
              {/* Grid Lines representing Latitude and Longitude */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--card-border)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Equator */}
              <line x1="0" y1="200" x2="800" y2="200" stroke="var(--card-border)" strokeWidth="1" strokeDasharray="5,5" />
              {/* Prime Meridian */}
              <line x1="400" y1="0" x2="400" y2="400" stroke="var(--card-border)" strokeWidth="1" strokeDasharray="5,5" />

              {/* Draw Flight Path Line */}
              {history.length > 1 && (
                <path
                  d={history
                    .map((rec, i) => {
                      const pt = mapCoordinates(rec.latitude, rec.longitude);
                      return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.8 }}
                />
              )}

              {/* Plot History Nodes */}
              {history.slice(0, -1).map((rec, idx) => {
                const pt = mapCoordinates(rec.latitude, rec.longitude);
                return (
                  <circle
                    key={rec.id}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="var(--primary)"
                    style={{ opacity: 0.4 }}
                  />
                );
              })}

              {/* Current ISS Node */}
              {currentRecord && (() => {
                const pt = mapCoordinates(currentRecord.latitude, currentRecord.longitude);
                return (
                  <g>
                    {/* Ripple Glow rings */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="1"
                      className="animate-pulse-glow"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="var(--primary)"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })()}
            </svg>

            {/* Map Labels */}
            <div style={styles.mapLabelEq}>EQUATOR</div>
            <div style={styles.mapLabelPm}>PRIME MERIDIAN</div>
          </div>
        </div>
      )}

      {/* Historical Telemetry Log Table */}
      <div className="glass-card animate-slide-up" style={styles.tableCard} id="telemetry-table-card">
        <div style={styles.sectionHeader}>
          <div style={styles.sectionHeaderTitle}>
            <Database size={18} color="var(--primary)" />
            <h2>Historical Flight Log</h2>
          </div>
          <div style={styles.tableSubtitle}>
            Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, history.length)} of {history.length} records
          </div>
        </div>

        {/* Telemetry Table */}
        <div className="table-container" style={styles.responsiveTable}>
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <Clock size={32} color="var(--text-muted)" style={{ marginBottom: "0.5rem" }} />
              <p>Establishing uplink. Waiting for initial stream packet...</p>
            </div>
          ) : (
            <table className="telemetry-table" id="telemetry-log-table">
              <thead>
                <tr>
                  <th>Sequence</th>
                  <th>Date</th>
                  <th>Uplink Time</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Altitude</th>
                  <th>Velocity</th>
                  <th>Orbital Zone</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((rec, index) => {
                  const seqNum = history.length - (indexOfFirstRecord + index);
                  return (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: "600", color: "var(--primary)" }}>#{seqNum}</td>
                      <td>{formatDate(rec.timestamp)}</td>
                      <td>{formatTime(rec.timestamp)}</td>
                      <td>{rec.latitude.toFixed(4)}°</td>
                      <td>{rec.longitude.toFixed(4)}°</td>
                      <td>{rec.altitude.toLocaleString()} km</td>
                      <td>{rec.velocity.toLocaleString()} km/h</td>
                      <td>
                        <span
                          className="badge"
                          style={
                            rec.visibility === "daylight"
                              ? { backgroundColor: "var(--accent-light)", color: "var(--accent)" }
                              : { backgroundColor: "var(--primary-light)", color: "var(--primary)" }
                          }
                        >
                          {rec.visibility}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {history.length > 0 && (
          <div style={styles.paginationRow}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={styles.pagBtn}
              id="btn-prev"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            <span style={styles.paginationPages}>
              Page <strong style={{ color: "var(--text-primary)" }}>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary"
              style={styles.pagBtn}
              id="btn-next"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    width: "100%",
  },
  controlStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
  },
  controlGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  controlBtn: {
    fontSize: "0.875rem",
    padding: "0.5rem 1rem",
  },
  themeToggleBtn: {
    padding: "0.5rem",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "var(--danger)",
    padding: "0.75rem 1.25rem",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  pulseIcon: {
    animation: "pulse-glow 1.5s infinite ease-in-out",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  statCard: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "-0.03em",
  },
  coordinateText: {
    display: "inline-block",
  },
  coordinateSeparator: {
    margin: "0 0.5rem",
    color: "var(--text-muted)",
  },
  skeletonText: {
    color: "var(--text-muted)",
    fontSize: "1.25rem",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    marginTop: "0.25rem",
  },
  mapCard: {
    padding: "1.5rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  sectionHeaderTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1.125rem",
    fontWeight: "700",
  },
  historyCounter: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--primary)",
    backgroundColor: "var(--primary-light)",
    padding: "0.25rem 0.625rem",
    borderRadius: "9999px",
  },
  mapContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: "0.75rem",
    overflow: "hidden",
    border: "1px solid var(--card-border)",
  },
  mapSvg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  mapLabelEq: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "0.6rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  mapLabelPm: {
    position: "absolute",
    left: "50%",
    bottom: "0.5rem",
    transform: "translateX(-50%)",
    fontSize: "0.6rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  tableCard: {
    padding: "1.5rem",
  },
  tableSubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
  responsiveTable: {
    maxHeight: "450px",
    overflowY: "auto",
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
  },
  paginationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.25rem",
    gap: "1rem",
  },
  pagBtn: {
    padding: "0.4rem 0.875rem",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  paginationPages: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
};
