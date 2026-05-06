import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <span className="error-boundary-icon">😵</span>
          <h2 className="error-boundary-title">Algo deu errado</h2>
          <p className="error-boundary-text">
            Um erro inesperado ocorreu. Seus dados estão salvos no dispositivo.
          </p>
          <p className="error-boundary-detail">
            {this.state.error?.message}
          </p>
          <div className="error-boundary-actions">
            <button
              className="btn btn-outline"
              onClick={() => window.history.back()}
            >
              ← Voltar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              🔄 Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
