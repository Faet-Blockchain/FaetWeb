
"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SecurityLogger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: '' };
  }

  static getDerivedStateFromError(): State {
    return { 
      hasError: true, 
      errorId: Math.random().toString(36).substr(2, 9) 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log security-relevant errors
    SecurityLogger.log({
      level: 'error',
      message: 'Application error caught by boundary',
      extra: {
        error: error.message,
        stack: error.stack || null,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 m-4">
          <h2 className="text-red-300 text-lg font-bold mb-2">
            Something went wrong
          </h2>
          <p className="text-red-400 text-sm">
            An error occurred. Please refresh the page and try again.
          </p>
          <p className="text-red-500 text-xs mt-2">
            Error ID: {this.state.errorId}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
