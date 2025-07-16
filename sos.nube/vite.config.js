import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = process.cwd() + "/../sos.config";
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,
    define: {
      __PANTALLA_NOMBRE__ : JSON.stringify(env.VITE_PANTALLA_NUBE_NOMBRE),
    },
    server: {
        open: true,
        host: env.VITE_PANTALLA_NUBE_SERVIDOR,
        port: env.VITE_PANTALLA_NUBE_PUERTO_WEB
    },  
  };
});
