import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const domain: string = 'lunarisapp.com';

const config: CapacitorConfig = {
  appId: 'com.lunarisapp.app',
  appName: 'Lunaris',
  webDir: 'dist/app',
  bundledWebRuntime: false,
  server: {
    hostname: `app.${domain}`,
    androidScheme: 'https',
    iosScheme: 'https',
  },
  backgroundColor: '#1D1D1D',
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Default,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound'],
    },
    CapacitorCookies: {
      enabled: true
    }
  },
};

export default config;
