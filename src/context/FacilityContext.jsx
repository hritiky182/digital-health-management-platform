import React, { createContext, useContext, useState, useEffect } from 'react';
import { FACILITIES } from '../data/facilities';
import { APP_CONFIG } from '../app/config';

const FacilityContext = createContext(null);

export function FacilityProvider({ children }) {
  const [currentFacilityId, setCurrentFacilityId] = useState(() => {
    return localStorage.getItem(APP_CONFIG.storageKeys.ACTIVE_FACILITY) || 'all';
  });

  const currentFacility = FACILITIES.find(f => f.id === currentFacilityId) || FACILITIES[0];

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.storageKeys.ACTIVE_FACILITY, currentFacilityId);
  }, [currentFacilityId]);

  const switchFacility = (facilityId) => {
    if (FACILITIES.some(f => f.id === facilityId)) {
      setCurrentFacilityId(facilityId);
    }
  };

  return (
    <FacilityContext.Provider
      value={{
        currentFacility,
        currentFacilityId,
        facilities: FACILITIES,
        switchFacility,
        isAllFacilities: currentFacilityId === 'all'
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) throw new Error('useFacility must be used within a FacilityProvider');
  return context;
}
