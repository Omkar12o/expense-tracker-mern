import { Component } from 'react';
import Alert from './ui/Alert';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <div className="w-full space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Alert variant="error" title="The page could not be displayed">
            {this.state.error.message || 'An unexpected error occurred.'}
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => this.setState({ error: null })}>Try again</Button>
            <Button variant="secondary" onClick={() => window.location.assign('/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
