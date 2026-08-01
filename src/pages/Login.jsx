import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Eye, EyeOff, Award } from 'lucide-react';

function ParticleCanvas() {
  useEffect(() => {
    const canvas = document.getElementById('login-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const particles = [];
    for(let i=0; i<45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 1
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.02)';
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      
      for(let i=0; i<particles.length; i++) {
        for(let j=i+1; j<particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas id="login-canvas" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

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

  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
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

        if (data.user && !data.session) {
          setNeedsConfirmation(true);
        } else {
          navigate('/');
        }
      } else {
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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize Google authentication.');
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div 
        className="auth-container" 
        ref={containerRef} 
        onMouseMove={handleMouseMove}
        style={{
          background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.05), transparent 80%), var(--bg)',
          position: 'relative'
        }}
      >
        <ParticleCanvas />
        <div className="auth-card reveal visible" style={{ position: 'relative', zIndex: 1, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="auth-header">
            <div className="avatar" style={{ margin: '0 auto 16px auto', background: 'var(--good-soft)', border: '1px solid var(--good)', width: '54px', height: '54px' }}>
              <Mail size={24} style={{ color: 'var(--good)' }} />
            </div>
            <h1>Check Your Email</h1>
            <p className="subtitle">We&apos;ve sent a verification link to:</p>
            <div className="email-highlight" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', marginTop: '8px', display: 'inline-block', color: 'var(--accent)' }}>{email}</div>
          </div>
          
          <div className="auth-body text-center" style={{ margin: '20px 0', fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
            <p>Please click the link in your email to confirm your account and log in.</p>
            <p className="text-muted" style={{ fontSize: '11.5px', marginTop: '10px', color: 'var(--text-faint)' }}>Didn&apos;t receive it? Check your spam folder or try again.</p>
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
    <div 
      className="auth-container" 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      style={{
        background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.05), transparent 80%), var(--bg)',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <ParticleCanvas />
      
      <div 
        className="auth-card reveal visible" 
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          border: '1px solid var(--border)', 
          background: 'var(--surface)',
          padding: '40px',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <Award size={32} style={{ color: 'var(--accent)' }} />
            <span className="logo-text" style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', letterSpacing: '0.05em' }}>修行 SHUGYO</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>
            {isSignUp ? 'Begin Your Journey' : 'Resume Your Training'}
          </h2>
          <p className="subtitle" style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {isSignUp 
              ? 'Create a database-backed DBMS mastery profile' 
              : 'Sign in to access your SQL and schema drills'
            }
          </p>
        </div>

        {errorMsg && (
          <div className="error-banner" style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', padding: '10px 14px', borderRadius: '6px', marginBottom: '18px', fontSize: '12.5px', color: 'var(--danger)' }}>
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="username" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Username</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="email" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Email Address</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '10px 36px 10px 36px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', outline: 'none', fontSize: '13px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ padding: '10px', fontSize: '13.5px', background: 'var(--text)', color: 'var(--bg)', borderRadius: '6px', fontWeight: '600' }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {/* Auth separator divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-faint)' }}>
          <div style={{ flexGrow: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>or</span>
          <div style={{ flexGrow: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {/* Continue with Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          className="btn btn-secondary btn-block"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '13px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {/* Simple Inline Google logo SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.91h6.63c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.87c2.26-2.09 3.56-5.18 3.56-8.4z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-2.98c-1.08.72-2.45 1.16-4.06 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.09C3.18 21.88 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.31c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31V6.61H1.21C.44 8.16 0 9.88 0 11.7s.44 3.54 1.21 5.09l4.11-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.09l4.11 3.09c.94-2.85 3.57-4.96 6.68-4.96z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-dim)' }}>
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: '600', textDecoration: 'underline', padding: 0 }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;
