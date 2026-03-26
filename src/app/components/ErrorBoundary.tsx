import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0a1e, #1a0f2e)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: 'white',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌙</div>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#c084fc' }}>
          ZodiacCycle needs a refresh
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
          A new version of the app was deployed. Clear the cache to get back in — it only takes 10 seconds.
        </p>

        {/* Steps */}
        <div style={{
          width: '100%', maxWidth: 360,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(192,132,252,0.2)',
          borderRadius: 20, padding: 20,
          marginBottom: 24, textAlign: 'left',
        }}>
          {isIOS ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 'bold', color: '#c084fc', marginBottom: 12 }}>📱 On iPhone / Safari:</p>
              {[
                'Open your iPhone Settings',
                'Scroll down and tap Safari',
                'Tap "Clear History and Website Data"',
                'Confirm and come back to the app',
                'Tap the refresh button below ↓',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(192,132,252,0.2)', color: '#c084fc',
                    fontSize: 11, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>{step}</p>
                </div>
              ))}
            </>
          ) : isAndroid ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 'bold', color: '#c084fc', marginBottom: 12 }}>🤖 On Android / Chrome:</p>
              {[
                'Tap the 3 dots menu (top right)',
                'Go to Settings → Privacy and security',
                'Tap "Clear browsing data"',
                'Select "Cached images and files"',
                'Tap Clear data, then come back',
                'Tap the refresh button below ↓',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(192,132,252,0.2)', color: '#c084fc',
                    fontSize: 11, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>{step}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 'bold', color: '#c084fc', marginBottom: 12 }}>💻 On desktop:</p>
              {[
                'Press Ctrl + Shift + Delete (Windows) or Cmd + Shift + Delete (Mac)',
                'Select "Cached images and files"',
                'Click Clear data',
                'Refresh the page',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(192,132,252,0.2)', color: '#c084fc',
                    fontSize: 11, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>{step}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%', maxWidth: 360,
            padding: '16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #c084fc, #f472b6)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            marginBottom: 12,
            boxShadow: '0 4px 20px rgba(192,132,252,0.4)',
          }}
        >
          ✨ Refresh ZodiacCycle
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
          Your data is safe — this only clears temporary files
        </p>
      </div>
    );
  }
}