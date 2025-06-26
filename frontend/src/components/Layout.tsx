import React from 'react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #a5b4fc, #bae6fd)',
      }}
    >
      {/* Header */}
      <header
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(180,200,255,0.35)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3b3b5c' }}>{title}</h1>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(180,200,255,0.35)',
          backdropFilter: 'blur(16px)',
          color: '#49506b',
          fontSize: '0.875rem',
        }}
      >
        &copy; {new Date().getFullYear()} AyuSahayak. All rights reserved.
      </footer>
    </section>
  );
} 