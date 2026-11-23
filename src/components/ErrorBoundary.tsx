import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected application error',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#DCE6DE] rounded-xl p-8 text-center">
            <h1 className="text-xl font-bold text-[#102116] mb-2">
              حدث خطأ غير متوقع / Unexpected Error
            </h1>
            <p className="text-sm text-[#4B6152] mb-6 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#0B5D27] text-white text-sm font-semibold rounded-lg hover:bg-[#08431C] transition-colors"
            >
              إعادة تحميل الصفحة / Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
