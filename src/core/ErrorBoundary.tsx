import * as React from 'react';

export class ErrorBoundary extends React.Component<any, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error(
      error,
      info.componentStack,
      React.captureOwnerStack(),
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <p>
            {JSON.stringify(this.state.error)}
        </p>
      );
    }

    return this.props.children;
  }
}