import React from 'react';

interface AdminGuardProps {
  admin: boolean;
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ admin, children }) => {
  if (!admin) {
    return <h1>ACCESO NO AUTORIZADO</h1>;
  }
  
  return <>{children}</>;
};

export default AdminGuard;