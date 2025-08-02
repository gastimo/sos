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
 * Objeto que representa a una particula simple 
 * que se desplaza en el plano 2D.
 */
function Particula(S) {
    let _posicion    = {x: S.O.S.aleatorio(POSICION_MIN,    POSICION_MAX), 
                       y: S.O.S.aleatorio(POSICION_MIN,    POSICION_MAX)};
    let _velocidad   = {x: S.O.S.aleatorio(VELOCIDAD_MIN,   VELOCIDAD_MAX,   true),     
                       y: S.O.S.aleatorio(VELOCIDAD_MIN,   VELOCIDAD_MAX,   true)};
    let _aceleracion = {x: S.O.S.aleatorio(ACELERACION_MIN, ACELERACION_MAX, true),   
                       y: S.O.S.aleatorio(ACELERACION_MIN, ACELERACION_MAX, true)};
    let _origen      = _copiar(_posicion);
    let _rebotar     = false;
    let _maxVelocidad;
    let _maxAceleracion;
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
        if (limite !== undefined) {
            _maxVelocidad = Math.abs(limite);
        }
        return _maxVelocidad;
    }
    
    function aceleracionMaxima(limite) {
        if (limite !== undefined) {
            _maxAceleracion = Math.abs(limite);
        }
        return _maxAceleracion;
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

    function actualizar() {
        // 1. ACELERACIÓN
        // Primero, se controla que la aceleración no supere el máximo
        // permitido. Luego se suma la aceleración a la velocidad.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        if (_maxAceleracion !== undefined) {
            _ajustarMagnitud(_aceleracion, _maxAceleracion);
        }        
        _adicionar(_velocidad, _aceleracion);
        
        // 2. VELOCIDAD
        // Se controla que la velocidad actualizada no supere el máximo
        // permitido. Luego se le suma la velocidad a la posición.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        if (_maxVelocidad !== undefined) {
            _ajustarMagnitud(_velocidad, _maxVelocidad);
        }
        _adicionar(_posicion, _velocidad);

        // 3. DURACIÓN
        // Se decrementa el contador de veces que la partícula ha sido
        // actualizada para llevar la cuenta del tiempo transcurrido.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        if (_duracion) {
            _duracion--;
        }
        
        // 4. REBOTE
        // Si se debe controlar el rebote, se verifica que las coordenadas
        // <x, y> no traspasen los bordes normalizados del plano <0, 1>.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
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
    
    function _magnitud(a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }
    
    function _ajustarMagnitud(v, m) {
        let _mag = _magnitud(v.x, v.y);
        if (_mag > m) {
            v.x = v.x * m / _mag;
            v.y = v.y * m / _mag;
        }
    }
    
    return {origen,
           posicion,
           velocidad,
           aceleracion,
           velocidadMaxima,
           aceleracionMaxima,
           distancia,
           direccion,
           duracion,
           rebotar,
           actualizar,
           caducada};
}

export default Particula;