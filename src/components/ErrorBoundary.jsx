import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary] ${this.props.boardName || 'Board'} crashed:`, error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 mb-1">
              The <strong>{this.props.boardName || 'board'}</strong> encountered an error.
            </p>
            <p className="text-xs text-red-500 dark:text-red-500 mb-6 font-mono bg-red-100 dark:bg-red-900/40 rounded p-2">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
