/*
 * =============================================================================
 * 
 *                       M Ó D U L O    M E N S A J E R Í A
 * 
 * =============================================================================
 */

/**
 * Mensajes
 * Singleton para la gestión del mensaje de "La Obra".
 */
var Mensajes = (() => {
    let _mensajes = [];
    let _mensajesClasificados = {};
    
    /**
     * recibir
     * Método que simplemente encola el mensaje recibido
     * para ser procesado posteriormente.
     */
    function recibir(msj, clasificar = false) {
        if (!clasificar) {
            _mensajes.push(msj);
        }
        else {
            const _clasificacion = msj[1];
            if (!_mensajesClasificados.hasOwnProperty(_clasificacion)) {
                _mensajesClasificados[_clasificacion] = [];
            }
            _mensajesClasificados[_clasificacion].push(msj);
        }
    }
    
    
    /**
     * recuperar
     * Retorna un arreglo con la lista de todos los mensajes
     * recibidos hasta el momento y aún no procesados.
     */
    function recuperar() {
        let _listaMsj = _mensajes.slice();
        _mensajes = [];
        return _listaMsj;
    }
    
    
    /**
     * recuperarClasificados
     * Retorna un objeto con los mensajes recibidos y aún
     * no procesados. Dentro del objeto, los mensajes están
     * clasificados (agrupados según remitente). 
     */
    function recuperarClasificados() {
        let _listaMsj = _mensajesClasificados;
        _mensajesClasificados = {};
        return _listaMsj;
    }
    
    
    return {recibir, 
           recuperar, 
           recuperarClasificados};
})();

