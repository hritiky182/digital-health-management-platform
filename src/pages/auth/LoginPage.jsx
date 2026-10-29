import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  BarChart3,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES } from '../../data/roles';
import { APP_CONFIG } from '../../app/config';
import { Badge } from '../../components/common/Badge';

export function LoginPage() {
  const { login, loginAsRole, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('dr.chen@northstar.demo.net');
  const [password, setPassword] = useState('careaxis2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target redirect path after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your staff workstation email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your healthcare access password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        success('Authentication Verified', `Welcome back, ${res.user.userName} (${res.user.badge}).`);
        navigate(from, { replace: true });
      } else {
        setErrorMessage('Invalid credentials. Select a pre-configured persona below.');
        error('Authentication Failed', 'Invalid staff credentials.');
      }
    }, 450);
  };

  const handleQuickPersonaLogin = (roleId) => {
    setLoading(true);
    setTimeout(() => {
      const res = loginAsRole(roleId);
      setLoading(false);
      success('Persona Authenticated', `Signed in as ${res.user.userName} (${res.user.name}).`);
      navigate(from, { replace: true });
    }, 300);
  };

  // Group roles for quick access
  const personaGroups = [
    {
      group: 'Clinical Care',
      roles: USER_ROLES.filter(r => ['physician', 'nurse', 'receptionist'].includes(r.id))
    },
    {
      group: 'Diagnostics & Pharmacy',
      roles: USER_ROLES.filter(r => ['pharmacist', 'lab_technician'].includes(r.id))
    },
    {
      group: 'Administration & Finance',
      roles: USER_ROLES.filter(r => ['platform_admin', 'facility_manager', 'billing_specialist'].includes(r.id))
    },
    {
      group: 'Governance & Analytics',
      roles: USER_ROLES.filter(r => ['inventory_manager', 'health_data_analyst', 'implementation_manager', 'support_specialist'].includes(r.id))
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(15, 118, 110, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(2, 132, 199, 0.08) 0%, transparent 40%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '920px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 16px rgba(15, 118, 110, 0.25)'
            }}
          >
            <HeartPulse size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {APP_CONFIG.name}
          </h1>
          <p style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Digital Health Management Platform
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Badge variant="teal">Demo Sandbox Environment</Badge>
            <Badge variant="blue">National eHealth Suite</Badge>
          </div>
        </div>

        {/* Main Grid: Form on Left, Quick Persona on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start'
          }}
        >
          {/* Card 1: Standard Credentials Login Form */}
          <div className="card" style={{ boxShadow: 'var(--shadow-dialog)', padding: '2rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Staff Authentication</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Enter your authorized clinical workstation credentials to unlock access.
              </p>
            </div>

            {errorMessage && (
              <div
                className="banner-alert banner-alert-danger"
                style={{ padding: '0.65rem 0.85rem', marginBottom: '1.25rem' }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Workstation Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="name@careaxis-health.demo.net"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Access Password</label>
                  <span style={{ fontSize: '0.725rem', color: '#0f766e', cursor: 'pointer' }} onClick={() => setPassword('careaxis2026')}>
                    Fill Demo Key
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                    placeholder="Enter password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#94a3b8'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Remember this workstation terminal session</span>
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
              >
                <span>{loading ? 'Authenticating Staff...' : 'Sign In to Portal'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <ShieldCheck size={16} color="#0f766e" />
              <span>TLS 1.3 Encrypted Session • Simulated ISO 27799 Compliant</span>
            </div>
          </div>

          {/* Card 2: 1-Click Healthcare Persona Quick Login */}
          <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} color="#0f766e" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  1-Click Healthcare Persona Access
                </h3>
              </div>
              <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
                Click any pre-configured role to immediately authenticate and experience role-aware permissions.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '430px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {personaGroups.map((group, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    {group.group}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {group.roles.map(r => (
                      <div
                        key={r.id}
                        onClick={() => handleQuickPersonaLogin(r.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#f0fdfa';
                          e.currentTarget.style.borderColor = '#0f766e';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#0f766e',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {r.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>
                            {r.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {r.userName} • {r.badge}
                          </div>
                        </div>
                        <ArrowRight size={14} color="#94a3b8" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          {APP_CONFIG.copyright} All patient identifiers and healthcare data are synthetic demonstration models.
        </div>
      </div>
    </div>
  );
}
