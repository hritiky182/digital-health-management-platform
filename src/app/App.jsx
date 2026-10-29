import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastProvider } from '../context/ToastContext';
import { OfflineProvider } from '../context/OfflineContext';
import { AuthProvider } from '../context/AuthContext';
import { FacilityProvider } from '../context/FacilityContext';
import { DataProvider } from '../context/DataContext';

export default function App() {
  return (
    <ToastProvider>
      <OfflineProvider>
        <AuthProvider>
          <FacilityProvider>
            <DataProvider>
              <RouterProvider router={router} />
            </DataProvider>
          </FacilityProvider>
        </AuthProvider>
      </OfflineProvider>
    </ToastProvider>
  );
}
