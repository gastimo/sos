import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = process.cwd() + "/../sos.config";
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,

    // DEFINICIÓN DEL SERVIDOR Y PUERTO 
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    server: {
        open: true,
        host: env.VITE_PANTALLA_ALFOLI_SERVIDOR,
        port: env.VITE_PANTALLA_ALFOLI_PUERTO_WEB
    },
    
    // DEFINICIÓN DE PARÁMETROS Y CONFIGURACIÓN DEL MÓDULO
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    define: {
      __PANTALLA_NOMBRE__         : JSON.stringify(env.VITE_PANTALLA_ALFOLI_NOMBRE),
      __OSC_DIRECCION_NUBE__      : JSON.stringify(env.OSC_DIRECCION_NUBE),
      __OSC_DIRECCION_ALFOLI__    : JSON.stringify(env.OSC_DIRECCION_ALFOLI),
      __OSC_MENSAJE_CONEXION__    : JSON.stringify(env.OSC_MENSAJE_CONEXION),
      __OSC_MENSAJE_DESCONEXION__ : JSON.stringify(env.OSC_MENSAJE_DESCONEXION),
      __OSC_MENSAJE_ARROBAR__     : JSON.stringify(env.OSC_MENSAJE_ARROBAR),
      __OSC_MENSAJE_OFRENDAR__    : JSON.stringify(env.OSC_MENSAJE_OFRENDAR)
    },
    
    optimizeDeps: {
      needsInterop: ['socorro'],
    },
  };
});
