/*
 * =============================================================================
 * 
 *                       M Ó D U L O    P A R T I C U L A
 * 
 * =============================================================================
 */

// Constantes de uso privado para los valores por
// defecto del desplazamiento de la partícula
const POSICION_MIN    = 0.06;
const POSICION_MAX    = 0.94;
const VELOCIDAD_MIN   = 0.00001;
const VELOCIDAD_MAX   = 0.00005;
const ACELERACION_MIN = 0.000001;
const ACELERACION_MAX = 0.000005;


/**
 * Particula
 * Objeto que representa a una particula simple que se desplaza en el plano.
 */
function Particula(S) {
    let _posicion    = {x: S.O.S.aleatorio(POSICION_MIN,   POSICION_MAX), y: S.O.S.aleatorio(POSICION_MIN,   POSICION_MAX)};
    let _velocidad   = {x: aleatorio(VELOCIDAD_MIN,   VELOCIDAD_MAX),     y: aleatorio(VELOCIDAD_MIN,   VELOCIDAD_MAX)};
    let _aceleracion = {x: aleatorio(ACELERACION_MIN, ACELERACION_MAX),   y: aleatorio(ACELERACION_MIN, ACELERACION_MAX)};
    let _origen      = _copiar(_posicion);
    let _rebotar     = false;
    let _maxVelocidad;
    let _duracion;
    
    function origen() {
        return _origen;
    }
    
    function posicion(x, y) {
        if (x !== undefined) {
            _posicion.x = x;
            _origen.x = x;
        }
        if (y !== undefined) {
            _posicion.y = y;
            _origen.y = y;
        }
        return _posicion;
    }
    
    function velocidad(x, y) {
        if (x !== undefined)
            _velocidad.x = x;
        if (y !== undefined)
            _velocidad.y = y;
        return _velocidad;
    }
    
    function aceleracion(x, y) {
        if (x !== undefined)
            _aceleracion.x = x;
        if (y !== undefined)
            _aceleracion.y = y;
        return _aceleracion;
    }
    
    function velocidadMaxima(limite) {
        _maxVelocidad = limite;
    }
    
    function distancia(particula) {
        return Math.sqrt(Math.pow(particula.posicion().x - _posicion.x, 2) + 
                        Math.pow(particula.posicion().y - _posicion.y, 2));
    }
    
    function direccion(particula) {
        let _posFinal = _copiar(particula.posicion());
        return _sustraer(_posFinal, posicion());
    }
    
    function duracion(cuadros) {
        if (cuadros !== undefined) {
            _duracion = cuadros;
        }
        return _duracion;
    }
    
    function rebotar(rebote) {
        if (rebote !== undefined) {
            _rebotar = rebote;
        }
        return _rebotar;
    }
    
    function aleatorio(min, max) {
        return S.O.S.aleatorio(min, max) * Math.sign(S.O.S.aleatorio(-1, 1)) ?? 1;
    }
    
    function actualizar() {
        // Actualizar velocidad y posición
        _adicionar(_velocidad, _aceleracion);
        _velocidad.x = Math.min(_velocidad.x, _maxVelocidad ?? _velocidad.x);
        _velocidad.y = Math.min(_velocidad.y, _maxVelocidad ?? _velocidad.y);
        _adicionar(_posicion, _velocidad);
        if (_duracion) {
            _duracion--;
        }
        
        // Evitar que se salga de coordenadas mediante el rebote
        if (_rebotar) {
            if (_posicion.x <= 0 || _posicion.x >= 1) {
                _posicion.x = _posicion.x <= 0 ? 0 : 1;
                velocidad(-_velocidad.x, _velocidad.y);
                aceleracion(_aceleracion.x * Math.sign(_velocidad.x) ?? 1, _aceleracion.y * Math.sign(_velocidad.y) ?? 1);
            }
            if (_posicion.y <= 0 || _posicion.y >= 1) {
                _posicion.y = _posicion.y <= 0 ? 0 : 1;
                velocidad(_velocidad.x, -_velocidad.y);
                aceleracion(_aceleracion.x * Math.sign(_velocidad.x) ?? 1, _aceleracion.y * Math.sign(_velocidad.y) ?? 1);
            }
        }
    }
    
    function caducada() {
        return _duracion !== undefined && _duracion <= 0;
    }
    
    function _copiar(v) {
        return {x: v.x, y: v.y};
    }
    
    function _adicionar(a, b) {
        a.x += b.x; 
        a.y += b.y;
        return a;
    }
    
    function _sustraer(a, b) {
        a.x -= b.x; 
        a.y -= b.y;
        return a;
    }
    
    return {origen,
           posicion,
           velocidad,
           aceleracion,
           velocidadMaxima,
           distancia,
           direccion,
           duracion,
           rebotar,
           aleatorio,
           actualizar,
           caducada};
}

export default Particula;