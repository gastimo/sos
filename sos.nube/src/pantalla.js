/*
 * =============================================================================
 * 
 *  EJEMPLO 1: SHADER SIMPLE BASE
 * 
 * =============================================================================
 */
import * as S from 'socorro';

let fragmentShader;
const escenificador = S.O.S.crearEscenaP5();

/**
 * alCargar (PRELOAD)
 */
escenificador.alCargar((S) => {
    fragmentShader = S.O.S.cargarShader('shaders/p5_fragment_base.frag');
});

/**
 * alComenzar (SETUP)
 */
escenificador.alComenzar((S) => {
    S.O.S.fragmentShader(fragmentShader);
    S.O.S.uniformTiempo("u_time");
    S.O.S.uniformResolucion("u_resolution");
});
