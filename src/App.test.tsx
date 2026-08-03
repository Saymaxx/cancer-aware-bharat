import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect } from 'vitest';
import { AuthGuard } from './App';

const STORAGE_KEY = 'test_session';
const REDIRECT_TO = '/login';

// Unsigned test JWT -- AuthGuard only ever reads the exp claim client-side,
// never verifies the signature, so a real signature isn't needed here.
function fakeJwt(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.`;
}

function renderGuarded(requiredRole?: string) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <AuthGuard storageKey={STORAGE_KEY} requiredRole={requiredRole} redirectTo={REDIRECT_TO}>
              <div>Protected Content</div>
            </AuthGuard>
          }
        />
        <Route path={REDIRECT_TO} element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthGuard', () => {
  it('redirects to the login route when no session exists', () => {
    renderGuarded();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders the protected content when a session exists and no role is required', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: 'volunteer' }));
    renderGuarded();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders the protected content when the session role matches the required role', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: 'admin' }));
    renderGuarded('admin');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when the session role does not match the required role', () => {
    // e.g. an admin session trying to open the superadmin dashboard URL directly
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: 'admin' }));
    renderGuarded('superadmin');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects when localStorage contains malformed JSON instead of throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    renderGuarded();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the protected content when the access token has not expired yet', () => {
    const notExpired = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: 'volunteer', accessToken: fakeJwt(notExpired) }));
    renderGuarded();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects and clears the session when the access token has already expired', () => {
    const alreadyExpired = Math.floor(Date.now() / 1000) - 3600;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: 'volunteer', accessToken: fakeJwt(alreadyExpired) }));
    renderGuarded();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
