/*
 * =============================================================================
 * 
 *                  M Ó D U L O    P A N T A L L A  /  N U B E
 * 
 * =============================================================================
 */
import * as S from 'socorro';

let fragmentShader;
const texturas = [];
const escenificador = S.O.S.crearEscena();

/**
 * alCargar (PRELOAD)
 * Se cargan los archivos necesarios (texturas y/o shaders).
 */
escenificador.alCargar((S) => {
    fragmentShader = S.O.S.cargarShader('shaders/nubes.frag');
});

/**
 * alComenzar (SETUP)
 * Se definen las variables "uniform" necesarias para la
 * ejecución de los "shaders".
 */
escenificador.alComenzar((S) => {
    S.O.S.fragmentShader(fragmentShader);
    S.O.S.uniformTiempo("u_time");
    S.O.S.uniformResolucion("u_resolution");
    S.O.S.uniform("u_direccion", 0.1, 0.1);
    S.O.S.uniform("u_degrade", 0.6);
    S.O.S.uniform("u_volumen", 0.2);
    S.O.S.uniform("u_rotacion", 3.2);
    S.O.S.uniform("u_velocidad", 0.3);
    S.O.S.uniform("u_zoom", 3.0);
});

