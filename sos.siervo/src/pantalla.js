/*
 * =============================================================================
 *  
 *                 M Ó D U L O    P A N T A L L A  -  S I E R V O
 * 
 * =============================================================================
 */
import * as S from 'socorro';
import Feed from './recompensa';

/**
 * Pantalla
 * Controlador de la pantalla del "Siervo"
 */
const Pantalla = (() => {
 const _feed = Feed(S.O.S, document.getElementById("SOS-Feed"));
})();
