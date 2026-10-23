import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Caught error:", error, info); }
  render() {
    if (this.state.hasError) return <div style={{padding: '2rem'}}><h1>UI Crashed:</h1><pre style={{color: 'red'}}>{this.state.error.toString()}</pre></div>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
          <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
