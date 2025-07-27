/*
 * =============================================================================
 * 
 *                       M Ó D U L O    S E G U I D O R
 * 
 * =============================================================================
 */


function Seguidor(S, identificador) {
    const _identificador = identificador;
    let   _conectado = true;
    let   _mensajes = [];
    let   _posicion = {x: S.O.S.azar(0.15, 0.85), y: S.O.S.azar(0.15, 0.85)};
    
    function posicion(x, y) {
        if (x !== undefined)
            _posicion.x = x;
        if (y !== undefined)
            _posicion.y = y;
        return _posicion;
    }
    
    function mensajes(msj) {
        _mensajes = [..._mensajes, ...msj];
    }

    function desplegar(ancho, alto) {
        const _posX = _posicion.x * ancho - ancho/2;
        const _posY = _posicion.y * alto - alto/2;
        S.O.S.P5.fill(0);
        S.O.S.P5.noStroke();
        S.O.S.P5.circle(_posX, _posY, 100);
    }
    
    return {posicion,
            mensajes,
            desplegar};
}

export default Seguidor;

