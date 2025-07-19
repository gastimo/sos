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
        host: env.VITE_PANTALLA_NUBE_SERVIDOR,
        port: env.VITE_PANTALLA_NUBE_PUERTO_WEB
    },
    
    
    // DEFINICIÓN DE PARÁMETROS Y CONFIGURACIÓN DEL MÓDULO
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    define: {
      __PANTALLA_NOMBRE__   : JSON.stringify(env.VITE_PANTALLA_NUBE_NOMBRE),
      __PANTALLA_ANCHO__    : 1920,
      __PANTALLA_ALTO__     : 1080
    },
  };
});
