import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminUser } from '../types';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, mfaCode?: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string; locked?: boolean }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  switchRole: (role: AdminRole) => Promise<boolean>;
  switchDemoRole: (role: AdminRole) => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; recoveryCode?: string }>;
  resetPassword: (email: string, recoveryCode: string, newPass: string) => Promise<{ success: boolean; message: string; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('smartbuy_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('smartbuy_admin_token') || null;
  });

  const [permissions, setPermissions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smartbuy_admin_perms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!adminToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/auth/me', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
          setPermissions(data.permissions);
          localStorage.setItem('smartbuy_admin_user', JSON.stringify(data.user));
          localStorage.setItem('smartbuy_admin_perms', JSON.stringify(data.permissions));
        } else {
          // Token expired or invalid
          setAdminUser(null);
          setAdminToken(null);
          setPermissions([]);
          localStorage.removeItem('smartbuy_admin_user');
          localStorage.removeItem('smartbuy_admin_token');
          localStorage.removeItem('smartbuy_admin_perms');
        }
      } catch {
        // network issue: keep cached state
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [adminToken]);

  const login = async (email: string, pass: string, mfaCode?: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, mfaCode }),
      });

      const data = await res.json();

      if (data.mfaRequired) {
        return { success: false, mfaRequired: true, error: data.message };
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed', locked: data.locked };
      }

      setAdminToken(data.token);
      setAdminUser(data.user);
      setPermissions(data.permissions);

      localStorage.setItem('smartbuy_admin_token', data.token);
      localStorage.setItem('smartbuy_admin_user', JSON.stringify(data.user));
      localStorage.setItem('smartbuy_admin_perms', JSON.stringify(data.permissions));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error connecting to Admin Gateway' };
    }
  };

  const logout = async () => {
    try {
      if (adminToken) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    } catch {
      // offline fallback
    } finally {
      setAdminToken(null);
      setAdminUser(null);
      setPermissions([]);
      localStorage.removeItem('smartbuy_admin_token');
      localStorage.removeItem('smartbuy_admin_user');
      localStorage.removeItem('smartbuy_admin_perms');
    }
  };

  const switchRole = async (targetRole: AdminRole) => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/auth/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ targetRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user);
        setPermissions(data.permissions);
        localStorage.setItem('smartbuy_admin_user', JSON.stringify(data.user));
        localStorage.setItem('smartbuy_admin_perms', JSON.stringify(data.permissions));
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  const hasPermission = (permission: string) => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true;
    return permissions.includes(permission);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    return headers;
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch('/api/admin/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  };

  const resetPassword = async (email: string, recoveryCode: string, newPass: string) => {
    const res = await fetch('/api/admin/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, recoveryCode, newPassword: newPass }),
    });
    return res.json();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        permissions,
        isAuthenticated: !!adminUser && !!adminToken,
        isLoading,
        login,
        logout,
        hasPermission,
        switchRole,
        switchDemoRole: switchRole,
        getAuthHeaders,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
