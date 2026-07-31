import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Eye, EyeOff, Award } from 'lucide-react';

export function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // Sign Up flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        // If email confirmation is enabled, Supabase returns user without a session
        // or check if session is null and user is created
        if (data.user && !data.session) {
          setNeedsConfirmation(true);
        } else {
          // If auto-confirm is enabled or local development config doesn't require verification
          navigate('/');
        }
      } else {
        // Sign In flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel fade-in">
          <div className="auth-header">
            <div className="icon-badge">
              <Mail size={32} className="accent-glow" />
            </div>
            <h1>Check Your Email</h1>
            <p className="subtitle">We&apos;ve sent a verification link to:</p>
            <div className="email-highlight">{email}</div>
          </div>
          
          <div className="auth-body text-center">
            <p>Please click the link in your email to confirm your account and log in.</p>
            <p className="text-muted">Didn&apos;t receive it? Check your spam folder or try again.</p>
          </div>

          <div className="auth-footer">
            <button 
              className="btn btn-secondary btn-block"
              onClick={() => {
                setNeedsConfirmation(false);
                setIsSignUp(false);
              }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel fade-in">
        <div className="auth-header">
          <div className="brand-logo">
            <Award size={40} className="logo-icon animate-float" />
            <span className="logo-text">修行 SHUGYO</span>
          </div>
          <h1>{isSignUp ? 'Begin Your Journey' : 'Resume Your Training'}</h1>
          <p className="subtitle">
            {isSignUp 
              ? 'Create a database-backed DBMS mastery profile' 
              : 'Sign in to access your SQL and schema drills'
            }
          </p>
        </div>

        {errorMsg && (
          <div className="error-banner fade-in">
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-large accent-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-loader">Processing...</span>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
