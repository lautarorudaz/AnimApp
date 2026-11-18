Object.assign(process.env, {
  VITE_USE_FIREBASE_EMULATORS: 'true', VITE_FIREBASE_PROJECT_ID: 'demo-animapp',
  VITE_FIREBASE_API_KEY: 'demo-api-key', VITE_FIREBASE_AUTH_DOMAIN: 'demo-animapp.firebaseapp.com',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo-animapp.appspot.com', VITE_FIREBASE_MESSAGING_SENDER_ID: '123456',
  VITE_FIREBASE_APP_ID: '1:123456:web:demo'
});
const { createServer } = await import('vite');
const server = await createServer({ server: { host: '127.0.0.1', port: 5178, strictPort: true } });
await server.listen();
