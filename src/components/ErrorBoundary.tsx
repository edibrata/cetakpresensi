import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 mt-10 max-w-2xl mx-auto bg-red-50 text-red-900 border border-red-200 rounded-lg shadow-sm font-sans">
          <h1 className="text-xl font-bold mb-4">Sorry, there was an error in the application.</h1>
          <p className="mb-4">Here are the details for debugging:</p>
          <div className="bg-red-100 p-4 rounded overflow-auto text-sm border border-red-200">
            <h2 className="font-semibold">{this.state.error && this.state.error.toString()}</h2>
            <br />
            <span className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
