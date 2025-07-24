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
    
    /**
     * recibir
     * Método que simplemente encola el mensaje recibido
     * para ser procesado posteriormente.
     */
    function recibir(msj) {
        _mensajes.push(msj);
    }
    
    
    /**
     * recuperarMensajes
     * Retorna un arreglo con la lista de todos los mensajes
     * recibidos hasta el momento y aún no procesados.
     */
    function recuperar() {
        let _listaMsj = _mensajes.slice();
        _mensajes = [];
        return _listaMsj;
    }
    
    return {recibir, recuperar};
})();

