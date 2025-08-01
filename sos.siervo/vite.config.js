import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const envDir = process.cwd() + "/../sos.config";
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,
    define: {
      __PANTALLA_NOMBRE__         : JSON.stringify(env.VITE_PANTALLA_SIERVO_NOMBRE),
      __OSC_DIRECCION_NUBE__      : JSON.stringify(env.OSC_DIRECCION_NUBE),
      __OSC_DIRECCION_ALFOLI__    : JSON.stringify(env.OSC_DIRECCION_ALFOLI),
      __OSC_MENSAJE_CONEXION__    : JSON.stringify(env.OSC_MENSAJE_CONEXION),
      __OSC_MENSAJE_DESCONEXION__ : JSON.stringify(env.OSC_MENSAJE_DESCONEXION),
      __OSC_MENSAJE_ARROBAR__     : JSON.stringify(env.OSC_MENSAJE_ARROBAR),
      __OSC_MENSAJE_OFRENDAR__    : JSON.stringify(env.OSC_MENSAJE_OFRENDAR),
      __CANTIDAD_INCENTIVOS__     : 3,
      __IMAGENES_INCENTIVOS__     : ['/imagenes/incentivo_01.jpg',
                                  '/imagenes/incentivo_02.jpg',
                                  '/imagenes/incentivo_03.jpg',
                                  '/imagenes/incentivo_04.jpg',
                                  '/imagenes/incentivo_05.jpg',
                                  '/imagenes/incentivo_06.jpg',
                                  '/imagenes/incentivo_07.jpg',
                                  '/imagenes/incentivo_08.jpg',
                                  '/imagenes/incentivo_09.jpg']
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
