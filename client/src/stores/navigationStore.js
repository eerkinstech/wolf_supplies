import { create } from 'zustand';

// Global navigation state so UI can react immediately on click
export const useNavigationStore = create((set) => ({
  isNavigating: false,
  startNavigation: () => set({ isNavigating: true }),
  stopNavigation: () => set({ isNavigating: false }),
}));

