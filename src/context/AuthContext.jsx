import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../data/roles';
import { APP_CONFIG } from '../app/config';
import { StorageService } from '../services/storageService';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = 'careaxis_auth_token_v1';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  });

  const [currentRoleId, setCurrentRoleId] = useState(() => {
    return localStorage.getItem(APP_CONFIG.storageKeys.ACTIVE_ROLE) || 'physician';
  });

  const [breakGlassSessions, setBreakGlassSessions] = useState(() => {
    try {
      const saved = sessionStorage.getItem('careaxis_breakglass_sessions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentRole = USER_ROLES.find(r => r.id === currentRoleId) || USER_ROLES[0];

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.storageKeys.ACTIVE_ROLE, currentRoleId);
  }, [currentRoleId]);

  const login = (email, password) => {
    // Look up user by email in fictional user roles or default to physician
    const matchedRole = USER_ROLES.find(r => r.userEmail.toLowerCase() === email.trim().toLowerCase()) ||
      USER_ROLES.find(r => r.id === 'physician');

    const token = `careaxis_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setCurrentRoleId(matchedRole.id);
    setIsAuthenticated(true);

    StorageService.addAuditLog({
      user: matchedRole.userName,
      role: matchedRole.name,
      action: 'USER_LOGIN',
      category: 'Security',
      resource: 'Enterprise Portal Authentication',
      facility: 'CareAxis Health Gateway',
      ipAddress: '10.24.0.12 (Secure Session)',
      status: 'SUCCESS',
      details: `Successful authentication with role: ${matchedRole.name} (${matchedRole.badge}).`
    });

    return { success: true, user: matchedRole };
  };

  const loginAsRole = (roleId) => {
    const role = USER_ROLES.find(r => r.id === roleId) || USER_ROLES[0];
    const token = `careaxis_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setCurrentRoleId(role.id);
    setIsAuthenticated(true);

    StorageService.addAuditLog({
      user: role.userName,
      role: role.name,
      action: 'USER_LOGIN',
      category: 'Security',
      resource: 'Enterprise Portal Authentication',
      facility: 'CareAxis Health Gateway',
      ipAddress: '10.24.0.12 (Direct Persona Auth)',
      status: 'SUCCESS',
      details: `Authenticated as demo persona: ${role.name}.`
    });

    return { success: true, user: role };
  };

  const logout = () => {
    const loggingOutRole = currentRole;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
    sessionStorage.removeItem('careaxis_breakglass_sessions');
    setBreakGlassSessions({});

    StorageService.addAuditLog({
      user: loggingOutRole.userName,
      role: loggingOutRole.name,
      action: 'USER_LOGOUT',
      category: 'Security',
      resource: 'Session Termination',
      facility: 'CareAxis Health Gateway',
      ipAddress: '10.24.0.12',
      status: 'SUCCESS',
      details: `Session securely terminated by user.`
    });
  };

  const switchRole = (newRoleId) => {
    const role = USER_ROLES.find(r => r.id === newRoleId);
    if (role) {
      setCurrentRoleId(newRoleId);
      StorageService.addAuditLog({
        user: role.userName,
        role: role.name,
        action: 'ROLE_SWITCH',
        category: 'Security',
        resource: `Switched active role to: ${role.name}`,
        facility: 'Demonstration Console',
        ipAddress: '127.0.0.1 (Local Client)',
        status: 'SUCCESS',
        details: `Simulated role switch in environment to ${role.badge}.`
      });
    }
  };

  const hasPermission = (permission) => {
    if (!currentRole) return false;
    if (currentRole.permissions.includes('*')) return true;
    return currentRole.permissions.includes(permission);
  };

  const activateBreakGlass = (patientId, patientMrn, reason) => {
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes session
    const updated = {
      ...breakGlassSessions,
      [patientId]: {
        patientId,
        patientMrn,
        reason,
        activatedAt: new Date().toISOString(),
        expiresAt,
        activatedBy: currentRole.userName
      }
    };
    setBreakGlassSessions(updated);
    try {
      sessionStorage.setItem('careaxis_breakglass_sessions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    StorageService.addAuditLog({
      user: currentRole.userName,
      role: currentRole.name,
      action: 'BREAK_GLASS_OVERRIDE',
      category: 'Security Exception',
      resource: `Restricted Record: ${patientMrn}`,
      facility: 'Emergency Care Context',
      ipAddress: '10.99.1.5 (Break-Glass)',
      status: 'AUDITED_OVERRIDE',
      details: `Clinical Emergency Override invoked. Reason: ${reason}`
    });
  };

  const isBreakGlassActive = (patientId) => {
    const session = breakGlassSessions[patientId];
    if (!session) return false;
    if (Date.now() > session.expiresAt) return false;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        loginAsRole,
        logout,
        currentRole,
        currentRoleId,
        roles: USER_ROLES,
        switchRole,
        hasPermission,
        activateBreakGlass,
        isBreakGlassActive,
        currentUser: {
          name: currentRole.userName,
          email: currentRole.userEmail,
          avatar: currentRole.avatar,
          department: currentRole.department,
          badge: currentRole.badge
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
