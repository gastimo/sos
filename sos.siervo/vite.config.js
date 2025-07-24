import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = process.cwd() + "/../sos.config";
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,
    define: {
      __PANTALLA_NOMBRE__           : JSON.stringify(env.VITE_PANTALLA_SIERVO_NOMBRE),
      __OSC_DIRECCION_NUBE__        : JSON.stringify(env.OSC_DIRECCION_NUBE),
      __OSC_DIRECCION_PRESENTALLA__ : JSON.stringify(env.OSC_DIRECCION_PRESENTALLA),
      __OSC_MENSAJE_CONEXION__      : JSON.stringify(env.OSC_MENSAJE_CONEXION),
      __OSC_MENSAJE_ARROBAR__       : JSON.stringify(env.OSC_MENSAJE_ARROBAR),
      __OSC_MENSAJE_OFRENDAR__      : JSON.stringify(env.OSC_MENSAJE_OFRENDAR),
      __CANTIDAD_INCENTIVOS__       : 3
    },
    server: {
        open: true,
        host: env.VITE_PANTALLA_SIERVO_SERVIDOR,
        port: env.VITE_PANTALLA_SIERVO_PUERTO_WEB
    },
    optimizeDeps: {
      needsInterop: ['socorro'],
    },
  };
});
