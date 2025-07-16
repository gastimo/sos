import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = process.cwd() + "/../sos.config";
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,
    define: {
      __PANTALLA_NOMBRE__ : JSON.stringify(env.VITE_PANTALLA_SIERVO_NOMBRE),
    },
    server: {
        open: true,
        host: env.VITE_PANTALLA_SIERVO_SERVIDOR,
        port: env.VITE_PANTALLA_SIERVO_PUERTO_WEB
    },  
  };
});
