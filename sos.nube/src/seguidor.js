/*
 * =============================================================================
 * 
 *                       M Ó D U L O    S E G U I D O R
 * 
 * =============================================================================
 */

import Particula from './particula.js';


/**
 * Seguidor
 * Usuario de la pantalla táctivl del "Siervo" arrobado por 
 * "La Nube" que comienza a interactuar con la pantalla principal 
 * al momento de escanear el código QR con la conexón.
 */
function Seguidor(S, identificador) {
    
    // Parámetros internos del seguidor
    const TIEMPO_OCIOSO_MAXIMO            = 45 * 1000;  // En segundos
    const DURACION_TRANSICION_ACTIVIDAD   = 35;         // En cuadros
    const DURACION_TRANSICION_INACTIVIDAD = 78;         // En cuadros
    const DURACION_TRANSICION_CONEXION    = 70;         // En cuadros
    const DURACION_TRANSICION_DESCONEXION = 83;         // En cuadros
    const DURACION_DESACELERACION         = 3;          // En cuadros
    const MAGNITUD_POR_DEFECTO            = 240;
    const MAGNITUD_MAXIMA_A_INCREMENTAR   = 1250;
    const SEPARADOR_MENSAJE_OSC           = "/";
    
    // Definición de los componentes del seguidor
    const _cuerpo = Particula(S);
    const _identificador = identificador;
    const _aceleracionInicial = {x: _cuerpo.aceleracion().x, y: _cuerpo.aceleracion().y};
    let   _apertura = false;
    let   _primerValorRegistrado;
    let   _ultimoValorRegistrado = 0;
    let   _ultimaActividad = new Date();
    let   _magnitud  = S.O.S.Variador(0, 0);
    let   _actividad = S.O.S.Variador(1, 1);
    let   _desaceleradorX = null;
    let   _desaceleradorY = null;
    
    /**
     * mensajes
     * Procesa la lista de mensajes que "La Nube" recibió en la
     * forma de plegarias enviadas por "El Siervo". El seguidor 
     * simplemente interpreta el comportamiento del siervo en su 
     * pantalla táctil (el "scrolling") para luego reflejar dicho 
     * comportamiento en la pantalla principal de "La Nube".
     */
    function mensajes(msj) {
        let _registraActividad = false;
        let _registraInteracción = false;
        let _registroPrevio = _ultimoValorRegistrado;
        
        // PROCESAMIENTO DE LOS MENSAJES (PLEGARIAS)
        // Se recorren los mensajes recibidos para determinar si hubo
        // desconexiones y para poder registrar la interacción actual
        // del siervo con su pantalla y la magnitud de ésta.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        for (let i = 0; i < msj.length; i++) {
            let _oscDireccion = msj[i][0];
            let _interaccion = msj[i][2];
            
            // Se decartan los mensajes no dirigidos a "La Nube"
            if (_oscDireccion.startsWith(SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_NUBE__)) {
                _registraActividad = true;
                
                // EVENTO DE CONEXIÓN
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                if (_oscDireccion == SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_NUBE__ + 
                                    SEPARADOR_MENSAJE_OSC + __OSC_MENSAJE_CONEXION__) {
                    _apertura = true;
                    if (_primerValorRegistrado === undefined) {
                        _primerValorRegistrado = _ultimoValorRegistrado;
                    }
                }
                
                // EVENTO DE DESCONEXIÓN
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                else if (_oscDireccion == SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_NUBE__ + 
                                    SEPARADOR_MENSAJE_OSC + __OSC_MENSAJE_DESCONEXION__) {
                    _cierre();
                }
                // EVENTO DE ARROBAMIENTO
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                else {
                    if (_oscDireccion == SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_NUBE__ + 
                                        SEPARADOR_MENSAJE_OSC + __OSC_MENSAJE_ARROBAR__) {
                        _ultimoValorRegistrado = _interaccion;
                        if (_primerValorRegistrado === undefined) {
                            _primerValorRegistrado = _ultimoValorRegistrado;
                            _registroPrevio = _primerValorRegistrado;
                            _apertura = true;
                        }
                        _registraInteracción = true;
                    }
                }
            } 
        }
        
        // REGISTRO DE ACTIVIDA E INTERACCIÓN
        // Una vez procesados los mensajes se registra efectivamente la actividad
        // y la interacción del siervo en su pantalla táctil, esto es:
        //  - ACTIVIDAD   : Si se recibió algún mensaje desde el siervo (cualquiera)
        //  - INTERACCIÓN : Si se recibió un mensaje de arrobamiento (scrolling)
        // En cualquiera de los dos casos, se deja registro interno en el seguidor.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        if (_registraActividad) {
            _ultimaActividad = new Date();
        }
        
        // El "Registro de la Interacción" indica la posición actual del "scroll" del 
        // siervo en su pantalla. Por otro lado, la "Magnitud" representa la intensidad
        // del "scroll", es decir, cuánto desplazamiento hizo desde el último registro.
        // Si dejase de moverse en su pantalla, la magnitud vuelve a su valor por defecto.
        if (_apertura) {
            _apertura = false;
            _actividad = S.O.S.Variador(1, 1); 
            _actividad.desvincular();
            _magnitud.reiniciar(0, MAGNITUD_POR_DEFECTO, DURACION_TRANSICION_CONEXION);
        }
        else if (_registraInteracción) {
            _actividad = S.O.S.Variador(1, 1); 
            _actividad.desvincular();
            let _nuevaMagnitud = Math.abs(_ultimoValorRegistrado - _registroPrevio) * 4.4;
            _nuevaMagnitud = Math.min(_nuevaMagnitud, MAGNITUD_MAXIMA_A_INCREMENTAR);
            _magnitud.reiniciar(MAGNITUD_POR_DEFECTO, Math.max(_nuevaMagnitud, MAGNITUD_POR_DEFECTO), 
                               DURACION_TRANSICION_ACTIVIDAD);
        }
    }
    
    /**
     * magnitud
     * Retorna un valor que representa la intensidad de la actividad
     * del siervo en su pantalla (cuanto "scrolling" realiza). 
     */
    function magnitud() {
        let _mag = _magnitud.valor();
        if (_magnitud.completado() && _mag > MAGNITUD_POR_DEFECTO) {
            _magnitud.reiniciar(_mag, MAGNITUD_POR_DEFECTO, DURACION_TRANSICION_INACTIVIDAD);
        }
        return _mag;
    }
    
    /**
     * enReposo
     * Indica si el seguidor no está actualmente interactuando
     * con su pantalla táctil (realizando "scrolling").
     */
    function enReposo() {
        return _magnitud.valor() <= MAGNITUD_POR_DEFECTO;
    }
    
    /**
     * aceleracion
     * Define los valores <x,y> de la aceleración del seguidor.
     */
    function aceleracion(x, y) {
        if (_desaceleradorX)
            x = _desaceleradorX.valor();
        if (_desaceleradorY)
            y = _desaceleradorY.valor();
        _cuerpo.aceleracion(x, y);
    }
    
    /**
     * desacelerar
     * Define "variadores" internos para controlar la
     * desaceleración de forma gradual y no brusca.
     */
    function desacelerar() {
        if (!_desaceleradorX)
            _desaceleradorX = S.O.S.Variador(_cuerpo.aceleracion().x, _aceleracionInicial.x * Math.sign(_cuerpo.aceleracion().x) * -1, 
                                            DURACION_DESACELERACION);
        if (!_desaceleradorY)
            _desaceleradorY = S.O.S.Variador(_cuerpo.aceleracion().y, _aceleracionInicial.y * Math.sign(_cuerpo.aceleracion().y) * -1, 
                                            DURACION_DESACELERACION);
    }
    
    /**
     * restablecer
     * Elimina los desaceleradores y deja que el seguidor 
     * se mueva normalmente.
     */
    function restablecer() {
        _desaceleradorX = null;
        _desaceleradorY = null;
    }
    
    /**
     * desconectado
     * Indica si el seguidor se encuentra actualmente desconectado,
     * ya sea por desconexión explícita o por inactividad.
     */
    function desconectado() {
        let _estadoActual = _actividad.valor();
        if ((new Date()).getTime() - _ultimaActividad.getTime() > TIEMPO_OCIOSO_MAXIMO &&
            _estadoActual == 1 && _actividad.vinculoPrevio() == null) {
            _cierre();
        }
        else if (!_actividad.valor()) {
            _primerValorRegistrado = undefined;
            _apertura = false;
            _actividad = S.O.S.Variador(1, 1); 
            _actividad.desvincular();
            return true;
        }
        return false;
    }
    
    /**
     * eliminar
     * Funcion encargada de gestionar la forma en la que el 
     * seguidor es removido de la lista de seguidores.
     */
    function eliminar() {
        console.log(" ===> SEGUIDOR " + _identificador + " DESCONECTADO!");
    }
    

    /**
     * _cierre
     * Define las variables para dar inicio a la transición
     * para la desconexión donde la magnitud va siendo 
     * reducida gradualmente.
     */
    function _cierre() {
        _magnitud.reiniciar(_magnitud.valor(), 0, DURACION_TRANSICION_DESCONEXION);
        _actividad.reiniciar(1, 0, 1); 
        _actividad.vincular(_magnitud);
    }
    
    
    return S.O.S.revelar({mensajes,
                         magnitud,
                         enReposo,
                         restablecer,
                         desacelerar,
                         desconectado,
                         eliminar},
                         _cuerpo);
}

export default Seguidor;

