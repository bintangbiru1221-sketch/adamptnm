"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="mx-auto h-48 w-48 mb-6"
            >
              <defs>
                <linearGradient id="errorGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                </linearGradient>
                <filter id="errorShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1"/>
                </filter>
              </defs>
              <circle cx="128" cy="128" r="100" fill="#fef2f2" stroke="url(#errorGrad1)" strokeWidth="4" filter="url(#errorShadow)"/>
              <circle cx="128" cy="128" r="80" fill="none" stroke="#fecaca" strokeWidth="3"/>
              <path d="M90 90 L166 166" stroke="#ef4444" strokeWidth="8" strokeLinecap="round"/>
              <path d="M166 90 L90 166" stroke="#ef4444" strokeWidth="8" strokeLinecap="round"/>
              <circle cx="128" cy="128" r="20" fill="#fecaca"/>
            </svg>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              Oops! Terjadi kesalahan
            </h1>
            <p className="text-muted text-sm mb-6">
              Silakan refresh halaman atau coba lagi nanti
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="inline-flex items-center justify-center gap-2 bg-ink text-canvas px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
