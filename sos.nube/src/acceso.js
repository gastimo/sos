/*
 * =============================================================================
 * 
 *                          M Ó D U L O    A C C E S O
 * 
 * =============================================================================
 */

const DURACION_TRANSICION   = 40;     // En cuadros
const RETARDO_ENTRADA       = 180;    // En cuadros
const PERMANENCIA_VISIBLE   = 1800;   // En cuadros
const PERMANENCIA_INVISIBLE = 360;    // En cuadros

const MARGEN_DERECHO = 18;            // En píxeles


/**
 * Acceso
 * Función responsable de mostrar una tarjeta en la esquina
 * inferior izquierda de la pantalla, con el código QR para
 * conectarse a la pantalla de "La Nube". 
 */
function Acceso(S, imagen, escala) {
    
    const _imagen = imagen.contenido();
    let _ancho    = _imagen.width  * escala;
    let _alto     = _imagen.height * escala;
    let _base     = -_alto;
    let _posicion = S.O.S.Variador(0, _base, DURACION_TRANSICION, RETARDO_ENTRADA);

    function desplegar(anchoPantalla, altoPantalla) {
        let _p = _posicion.valor();
        let _posY = altoPantalla + _p;
        S.O.S.P5.image(_imagen, MARGEN_DERECHO - (anchoPantalla/2), _posY - (altoPantalla / 2), _ancho, _alto);
        if (_posicion.completado()) {
            _base *= -1;
            let _retardo = _base > 0 ? PERMANENCIA_VISIBLE : PERMANENCIA_INVISIBLE;
            _posicion.reiniciar(_p, _base, DURACION_TRANSICION, _retardo);
        }
    }
    
    function esconder() {
        _base = _alto;
        let _p = _posicion.valor();
        _posicion.reiniciar(_p, _base, DURACION_TRANSICION, 0);
    }
    
    return {desplegar, esconder};
}

export default Acceso;