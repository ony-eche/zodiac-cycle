import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    console.log('[ErrorBoundary] Initialized');
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('[ErrorBoundary] getDerivedStateFromError caught:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('[ErrorBoundary] Showing error UI');
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-4xl">😵</div>
            <h1 className="text-xl font-bold text-red-500">Something went wrong</h1>
            <p className="text-sm text-muted-foreground break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    console.log('[ErrorBoundary] Rendering children');
    return this.props.children;
  }
}