import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.successhabittracker.app',
  appName: 'success-habit-tracker',
  webDir: 'dist',
  server: {
    url: 'https://2bf64ed6-7e81-4c09-82fc-cb3a4c8cfb88.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
