/*
 * =============================================================================
 * 
 *                       M Ó D U L O    O F E R E N T E
 * 
 * =============================================================================
 */
import Particula from './particula.js';
import Ofrenda from './ofrenda.js';


/**
 * Oferente
 * Usuario de la pantalla táctivl del "Siervo" que de manera
 * involuntaria (o no tanto) envía ofrendas digitales (sus
 * datos personales) para ser recolectados por "El Alfolí".
 */
function Oferente(S, identificador, recursos) {
    
    // Parámetros internos del oferente
    const TIEMPO_OCIOSO_MAXIMO            = 60 * 1000;  // En segundos
    const DURACION_TRANSICION_ACTIVIDAD   = 35;         // En cuadros
    const DURACION_TRANSICION_INACTIVIDAD = 30;         // En cuadros
    const DURACION_TRANSICION_CONEXION    = 70;         // En cuadros
    const DURACION_TRANSICION_DESCONEXION = 83;         // En cuadros
    const DURACION_DESACELERACION         = 3;          // En cuadros
    const MAGNITUD_POR_DEFECTO            = 240;
    const MAGNITUD_MAXIMA_A_INCREMENTAR   = 1250;
    const SEPARADOR_MENSAJE_OSC           = "/";

    // Definición de los componentes del oferente
    const _cuerpo = Particula(S);
    const _identificador = identificador;
    let   _ofrendasPrevias = [];
    let   _ofrendaEnCurso;
    let   _apertura = false;
    let   _primerValorRegistrado;
    let   _ultimoValorRegistrado = 0;
    let   _ultimaActividad = new Date();
    let   _magnitud  = S.O.S.Variador(0, 0);
    let   _actividad = S.O.S.Variador(1, 1);
    const Datos = {siervo: null, recaudador: null};
    _iniciar();
    
    
    /**
     * _iniciar
     * Inicializa los datos del oferente
     */
    function _iniciar() {
        if (_identificador) {
            let _indice = _identificador.indexOf(":", 2);
            if (_indice >= 0) {
                Datos.siervo = _identificador.substring(_indice + 1);
            }
        }
    }
    
    /**
     * mensajes
     * Procesa la lista de mensajes que "El Alfolí" recibió en la forma
     * de ofrendas digitales enviadas (involuntariamente) por "El Siervo". 
     * La cantidad de mensajes recibidos está vinculada directamente
     * con la interacción del siervo con su pantalla táctil. Cuanto 
     * más tiempo permanece conectado y cuánto más intensa sea la 
     * actividad de su "scrolling", mayor será la cantidad de mesajes 
     * enviados hacia "El Alfolí" y contabilizados por este módulo.
     */
    function mensajes(msj) {
        let _registraActividad = false;
        let _registraInteracción = false;
        let _registroPrevio = _ultimoValorRegistrado;
        
        // PROCESAMIENTO DE LOS MENSAJES (OFRENDAS)
        // Se recorren los mensajes recibidos para determinar si hubo
        // desconexiones y para poder registrar la interacción actual
        // del siervo con su pantalla y la magnitud de ésta.
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        for (let i = 0; i < msj.length; i++) {
            let _oscDireccion = msj[i][0];
            let _interaccion = msj[i][2];
            
            // Se decartan los mensajes no dirigidos a "El Alfolí"
            if (_oscDireccion.startsWith(SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_ALFOLI__)) {
                _registraActividad = true;
                
                // EVENTO DE CONEXIÓN
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                if (_oscDireccion == SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_ALFOLI__ + 
                                    SEPARADOR_MENSAJE_OSC + __OSC_MENSAJE_CONEXION__) {
                    _apertura = true;
                    if (_primerValorRegistrado === undefined) {
                        _primerValorRegistrado = _ultimoValorRegistrado;
                    }
                }
                
                // EVENTO DE DESCONEXIÓN
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                else if (_oscDireccion == SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_ALFOLI__ + 
                                         SEPARADOR_MENSAJE_OSC + __OSC_MENSAJE_DESCONEXION__) {
                    _cierre();
                }
                
                // EVENTO DE ENTREGA DE OFRENDA DIGITAL
                // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                else {
                    Datos.recaudador = msj[i][3];
                    if (_oscDireccion == SEPARADOR_MENSAJE_OSC + __OSC_DIRECCION_ALFOLI__ + 
                                        SEPARADOR_MENSAJE_OSC + __OSC_MENSAJE_OFRENDAR__) {
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
        
        // REGISTRO DE ACTIVIDAD E INTERACCIÓN
        // Una vez procesados los mensajes se registra efectivamente la actividad
        // y la interacción del siervo en su pantalla táctil, esto es:
        //  - ACTIVIDAD   : Si se recibió algún mensaje desde el siervo (cualquiera)
        //  - INTERACCIÓN : Si se recibió un mensaje de ofrenda (scrolling)
        // En cualquiera de los dos casos, se deja registro interno en el oferente.
        // El grado de interacción del siervo es medido como la "Magnitud".
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        if (_registraActividad) {
            _ultimaActividad = new Date();
        }
        
        // El registro de la interacción indica la posición actual del "scroll" del 
        // siervo en su pantalla. Por otro lado, la "Magnitud" representa la intensidad
        // del "scroll", es decir, cuánto desplazamiento hizo desde el último registro.
        // Si dejase de moverse en su pantalla, la magnitud vuelve a su valor por defecto.
        if (_apertura) {
            _apertura = false;
            _actividad = S.O.S.Variador(1, 1);  // Variador para registrar el estado actual
            _actividad.desvincular();           // Desvincular el estado de la magnitud (por cierre)
            // Se inicia el "variador" para llevar la "Magnitud" a su valor por defecto
            _magnitud.reiniciar(0, MAGNITUD_POR_DEFECTO, DURACION_TRANSICION_CONEXION);
        }
        else if (_registraInteracción) {
            // Actualización del estado
            _actividad = S.O.S.Variador(1, 1);  // Variador para registrar el estado actual
            _actividad.desvincular();           // Desvincular el estado de la magnitud (por cierre)

            // Actualización de la "Magnitud"
            let _nuevaMagnitud = Math.abs(_ultimoValorRegistrado - _registroPrevio) * 4.4;
            _nuevaMagnitud = Math.min(_nuevaMagnitud, MAGNITUD_MAXIMA_A_INCREMENTAR);
            _magnitud.reiniciar(MAGNITUD_POR_DEFECTO, Math.max(_nuevaMagnitud, MAGNITUD_POR_DEFECTO), 
                               DURACION_TRANSICION_ACTIVIDAD);
            
            // Actualización de la ofrenda
            if (!_ofrendaEnCurso) {
                _ofrendaEnCurso = Ofrenda(S, Datos, recursos);
            }
            else {
                _ofrendaEnCurso.reiniciar();
            }
        }
    }
    
    /**
     * contabilizar
     * Función principal del oferente, invocada en cada ciclo del bucle.
     * Se ocupa de procesar las ofrendas creadas al momento de recibir 
     * los mensajes. Esta función no crea nuevas ofrendas, simplemente
     * se encarga de gestionar las ofrendas en curso para determinar si
     * sus datos deben ser actualizados o si ya es momento de cerrarlas 
     * y enviadas a "El Alfolí".
     */
    function contabilizar(ancho, alto, alfoliPosX, alfoliPosY) {
        // Si hay una ofrenda en curso, pero el siervo se encuentra 
        // en reposo, se verifica si no es el momento de cerrar la
        // ofrenda y enviarla a "El Alfolí" para ser contabilizada.
        if (enReposo() && _ofrendaEnCurso && !_ofrendaEnCurso.vigente()) {
            _ofrendasPrevias.push(_ofrendaEnCurso);
            _ofrendaEnCurso.enviar(alfoliPosX, alfoliPosY);  // Es enviada a "El Alfolí"
            _ofrendaEnCurso = null;
        }
        
        // Luego, se procesde a desplegar las ofrendas previas
        // así también como la ofrenda que esté en curso.
        let _op = [];
        for (let i = 0; i < _ofrendasPrevias.length; i++) {
            if (!_ofrendasPrevias[i].entregada()) {
                _ofrendasPrevias[i].desplegar(ancho, alto);
                _op.push(_ofrendasPrevias[i]);
            }
        }
        _ofrendasPrevias = _op;
        if (_ofrendaEnCurso) {
            _ofrendaEnCurso.desplegar(ancho, alto);
        }
    }
    
    /**
     * magnitud
     * Retorna un valor que representa la intensidad de la actividad
     * del siervo en su pantalla (cuanto "scrolling" realiza). 
     * La "Magnitud" se incremena y decrementa gradualmente mediante
     * un "variador" para no producir saltos bruscos.
     * Después de un tiempo sin recibir mensajes que modifiquen la 
     * "Magnitud", el "variador" es automáticamente reiniciado para 
     * devolver la "Magnitud" a su nivel por defecto.
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
     * Indica si el oferente no está actualmente interactuando
     * con su pantalla táctil (realizando "scrolling"). Esto se
     * puede detectar al no haber cambios en la "Magnitud".
     */
    function enReposo() {
        return magnitud() <= MAGNITUD_POR_DEFECTO;
    }
    
    /**
     * desconectado
     * Indica si el oferente se encuentra actualmente desconectado,
     * ya sea por desconexión explícita o por inactividad.
     * Para determinar esto se verifican dos condiciones:
     *  1. El tiempo tanscurrido desde la última actividad.
     *  2. La recepción de un mensaje OSC de desconexión.
     * Para llevar el registro del estado actual del oferente se utiliza  
     * un "variador" (en este caso, "_actividad") en lugar de una variable
     * simple, dado que la desconexión implica una transición: cuando se 
     * detecta la desconexión (por mensaje o por inactividad) se inicia
     * el variador que decrementa gradualmente la "Magnitud" hasta cero.
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
     * Funcion encargada de gestionar las tareas necesarias post-remoción 
     * del oferente de la lista (en este punto el oferente ya fue quitado).
     */
    function eliminar() {
        console.log(" ===> OFERENTE " + _identificador + " DESCONECTADO!");
    }
    
    /**
     * _cierre
     * Define las variables para dar inicio a la transición de desconexión.
     * Básicamente, el valor de la "Magnitud" es decrementado gradualmente
     * mediante un "variador" que, a su vez, se lo vincula con el "variador"
     * de la "Actividad". Cuando el variador de la "Magnitud" llegue a cero,
     * se dispara el "variador" de actividad para ponerlo en "falso".
     */
    function _cierre() {
        _magnitud.reiniciar(_magnitud.valor(), 0, DURACION_TRANSICION_DESCONEXION);
        _actividad.reiniciar(1, 0, 1); 
        _actividad.vincular(_magnitud);
    }
    
    return S.O.S.revelar({mensajes,
                         magnitud,
                         enReposo,
                         desconectado,
                         eliminar,
                         contabilizar},
                         _cuerpo);
}

export default Oferente;

