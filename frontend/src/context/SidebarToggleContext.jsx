import { createContext, useContext } from 'react';

const SidebarToggleContext = createContext({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export function SidebarToggleProvider({ value, children }) {
  return (
    <SidebarToggleContext.Provider value={value}>
      {children}
    </SidebarToggleContext.Provider>
  );
}

export function useSidebarToggle() {
  return useContext(SidebarToggleContext);
}
