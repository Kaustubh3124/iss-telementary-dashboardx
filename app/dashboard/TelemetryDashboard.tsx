"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
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
import styles from "./TelemetryDashboard.module.css";

interface TelemetryRecord {
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

  const fetchTelemetry = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await axios.get("https://api.wheretheiss.at/v1/satellites/25544");
      const data = response.data;
      
      const newRecord: TelemetryRecord = {
        timestamp: data.timestamp,
        latitude: parseFloat(data.latitude.toFixed(4)),
        longitude: parseFloat(data.longitude.toFixed(4)),
        altitude: parseFloat(data.altitude.toFixed(2)),
        velocity: parseFloat(data.velocity.toFixed(2)),
        visibility: data.visibility
      };

      setCurrentRecord(newRecord);
      setHistory((prev) => {
        if (prev.some((r) => r.timestamp === newRecord.timestamp)) {
          return prev;
        }
        return [...prev, newRecord];
      });
      setError(null);
    } catch (err) {
      console.error("Uplink sync failed:", err);
      setError("Unable to sync telemetry. Retrying connection...");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const timer = setInterval(() => {
      fetchTelemetry();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  const sortedHistory = [...history].reverse();
  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / recordsPerPage));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedHistory.slice(indexOfFirstRecord, indexOfLastRecord);

  const formatTime = (unixSecs: number) => {
    const date = new Date(unixSecs * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  const formatDate = (unixSecs: number) => {
    const date = new Date(unixSecs * 1000);
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

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
    <div className={`animate-fade-in ${styles.dashboardContainer}`} id="telemetry-dashboard-container">
      <div className={styles.controlStrip}>
        <div className={styles.controlGroup}>
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={isRefreshing || isLoading}
            className={`btn-secondary ${styles.controlBtn}`}
            title="Force telemetry refresh"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Syncing..." : "Sync Now"}</span>
          </button>
          <button
            onClick={() => setIsMapVisible(!isMapVisible)}
            className={`btn-secondary ${styles.controlBtn}`}
            title="Toggle Orbital Map"
          >
            <Map size={16} />
            <span>{isMapVisible ? "Hide Map" : "Show Map"}</span>
          </button>
        </div>

        <div className={styles.controlGroup}>
          <button
            onClick={toggleDarkMode}
            className={`btn-secondary ${styles.themeToggleBtn}`}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} color="#facc15" /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={handleLogout}
            className={`btn-danger ${styles.logoutBtn}`}
            id="btn-logout"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {error && (
        <div className={`animate-slide-up ${styles.errorBanner}`}>
          <RefreshCw size={18} className={`animate-spin ${styles.pulseIcon}`} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`} id="card-position">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Coordinates</span>
            <Compass size={20} color="var(--primary)" />
          </div>
          <div className={styles.cardValue}>
            {isLoading ? (
              <span className={styles.skeletonText}>Loading...</span>
            ) : (
              <>
                <span className={styles.coordinateText}>{currentRecord?.latitude}° N</span>
                <span className={styles.coordinateSeparator}>,</span>
                <span className={styles.coordinateText}>{currentRecord?.longitude}° E</span>
              </>
            )}
          </div>
          <div className={styles.cardFooter}>
            <span className="badge badge-primary">
              Position Vector
            </span>
          </div>
        </div>

        <div className={`glass-card ${styles.statCard}`} id="card-altitude">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Altitude</span>
            <ArrowUpRight size={20} color="var(--accent)" />
          </div>
          <div className={styles.cardValue}>
            {isLoading ? (
              <span className={styles.skeletonText}>Loading...</span>
            ) : (
              <span>{currentRecord?.altitude?.toLocaleString()} km</span>
            )}
          </div>
          <div className={styles.cardFooter}>
            <span className="badge badge-success">
              Orbital height
            </span>
          </div>
        </div>

        <div className={`glass-card ${styles.statCard}`} id="card-velocity">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Velocity</span>
            <TrendingUp size={20} color="var(--danger)" />
          </div>
          <div className={styles.cardValue}>
            {isLoading ? (
              <span className={styles.skeletonText}>Loading...</span>
            ) : (
              <span>{currentRecord?.velocity?.toLocaleString()} km/h</span>
            )}
          </div>
          <div className={styles.cardFooter}>
            <span className="badge badge-danger">
              Hypersonic flight
            </span>
          </div>
        </div>
      </div>

      {isMapVisible && (
        <div className={`glass-card animate-slide-up ${styles.mapCard}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderTitle}>
              <Map size={18} color="var(--primary)" />
              <h2>Orbital Track Projection</h2>
            </div>
            <span className={styles.historyCounter}>
              Plotting {history.length} point{history.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={styles.mapContainer}>
            <svg
              viewBox="0 0 800 400"
              className={styles.mapSvg}
              id="orbital-path-svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--card-border)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <line x1="0" y1="200" x2="800" y2="200" stroke="var(--card-border)" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="400" y1="0" x2="400" y2="400" stroke="var(--card-border)" strokeWidth="1" strokeDasharray="5,5" />

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

              {history.slice(0, -1).map((rec) => {
                const pt = mapCoordinates(rec.latitude, rec.longitude);
                return (
                  <circle
                    key={rec.timestamp}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="var(--primary)"
                    style={{ opacity: 0.4 }}
                  />
                );
              })}

              {currentRecord && (() => {
                const pt = mapCoordinates(currentRecord.latitude, currentRecord.longitude);
                return (
                  <g>
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

            <div className={styles.mapLabelEq}>EQUATOR</div>
            <div className={styles.mapLabelPm}>PRIME MERIDIAN</div>
          </div>
        </div>
      )}

      <div className={`glass-card animate-slide-up ${styles.tableCard}`} id="telemetry-table-card">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderTitle}>
            <Database size={18} color="var(--primary)" />
            <h2>Historical Flight Log</h2>
          </div>
          <div className={styles.tableSubtitle}>
            Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, history.length)} of {history.length} records
          </div>
        </div>

        <div className={`table-container ${styles.responsiveTable}`}>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
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
                    <tr key={rec.timestamp}>
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

        {history.length > 0 && (
          <div className={styles.paginationRow}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`btn-secondary ${styles.pagBtn}`}
              id="btn-prev"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            <span className={styles.paginationPages}>
              Page <strong style={{ color: "var(--text-primary)" }}>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`btn-secondary ${styles.pagBtn}`}
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
