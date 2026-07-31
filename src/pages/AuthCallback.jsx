import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase JS client automatically handles hash/query parameter parsing
    // and updates session state on page load.
    // We just wait briefly and redirect.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/', { replace: true });
      } else {
        // Give it a tiny bit of time to resolve or redirect to login
        const timeout = setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
        return () => clearTimeout(timeout);
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="fullscreen-loader">
      <div className="loader-card">
        <div className="spinner"></div>
        <h2>修行 SHUGYO</h2>
        <p>Verifying authentication ticket...</p>
      </div>
    </div>
  );
}
