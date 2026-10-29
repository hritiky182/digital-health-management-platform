import React, { useState } from 'react';
import {
  Menu,
  Building2,
  UserCheck,
  Search,
  Bell,
  HelpCircle,
  PlusCircle,
  ChevronDown,
  Wifi,
  WifiOff,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFacility } from '../../context/FacilityContext';
import { useOffline } from '../../context/OfflineContext';
import { DemoBadge } from '../feedback/DemoBadge';
import { APP_CONFIG } from '../../app/config';
import { useNavigate } from 'react-router-dom';

export function TopNavbar({ onToggleSidebar, onQuickAction }) {
  const { currentRole, roles, switchRole, currentUser, logout } = useAuth();
  const { currentFacility, facilities, switchFacility } = useFacility();
  const { isOfflineMode, pendingCount } = useOffline();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFacilityMenu, setShowFacilityMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="top-navbar">
      {/* Left: Hamburger & Facility Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn-icon"
          onClick={onToggleSidebar}
          title="Toggle Navigation Sidebar"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <Menu size={20} />
        </button>

        {/* Facility Context Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowFacilityMenu(!showFacilityMenu);
              setShowRoleMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#1e293b'
            }}
          >
            <Building2 size={16} color="#0f766e" />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Current Facility Context</div>
              <div style={{ fontWeight: 600 }}>{currentFacility.name}</div>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showFacilityMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setShowFacilityMenu(false)}
              />
              <div
                className="card"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '110%',
                  width: '320px',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-dialog)',
                  padding: '0.5rem'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Select Facility Scope
                </div>
                {facilities.map(f => (
                  <div
                    key={f.id}
                    onClick={() => {
                      switchFacility(f.id);
                      setShowFacilityMenu(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: f.id === currentFacility.id ? '#f0fdfa' : 'transparent',
                      color: f.id === currentFacility.id ? '#0f766e' : '#334155'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{f.name}</div>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      {f.level} • {f.region}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle: Global Search */}
      <div style={{ flex: 1, maxWidth: '420px', margin: '0 1.5rem', display: 'none', position: 'relative' }} className="search-desktop">
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search patient name, MRN, UPID or clinical record..."
          style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.8125rem' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleGlobalSearch}
        />
      </div>

      {/* Right: Actions, Demo Badge & Interactive Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Offline sync indicator if applicable */}
        {isOfflineMode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              fontSize: '0.75rem',
              border: '1px solid #fecaca'
            }}
          >
            <WifiOff size={14} />
            <span>Store & Forward ({pendingCount})</span>
          </div>
        )}

        <DemoBadge />

        {/* Quick Action Button */}
        {onQuickAction && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onQuickAction}
            title="Open Quick Clinical Action Launcher"
          >
            <PlusCircle size={15} />
            <span style={{ display: 'none' }} className="d-sm-inline">Quick Action</span>
          </button>
        )}

        {/* Interactive Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowFacilityMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.775rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentUser.avatar}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#0f766e', fontWeight: 500 }}>
                {currentRole.badge} ▾
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setShowRoleMenu(false)}
              />
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '340px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-dialog)',
                  padding: '0.5rem'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Active Persona / Role Switcher
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
                    Switch role to test distinct navigation, permissions & workflows.
                  </div>
                </div>

                <div style={{ marginTop: '0.35rem' }}>
                  {roles.map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id);
                        setShowRoleMenu(false);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        backgroundColor: r.id === currentRole.id ? '#f0fdfa' : 'transparent',
                        borderLeft: r.id === currentRole.id ? '3px solid #0f766e' : '3px solid transparent'
                      }}
                    >
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: r.id === currentRole.id ? '#0f766e' : '#e2e8f0',
                          color: r.id === currentRole.id ? '#ffffff' : '#475569',
                          fontSize: '0.7rem',
                          fontWeight: 600,
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
                          {r.userName} • {r.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                      navigate('/login');
                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      color: '#dc2626',
                      borderColor: '#fecaca',
                      backgroundColor: '#fef2f2',
                      fontSize: '0.775rem'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out & Lock Workstation</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
