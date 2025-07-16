/* =============================================================================
 * 
 *         C O N E X I Ó N    P A R A    L A    P R E S E N T A L L A
 * 
 * =============================================================================
 */


/**
 * WEB SOCKET 2 - "La Presentalla" (puerto 8091)
 * Intermediario (web socket) entre la nube y sus seguidores.
 * Responsable de recibir y canalizar los mensajes de los 
 * siervos hacia la nube a través del protocolo OSC, durante
 * el ritual de arrobamiento y veneración.
 */

var osc1 = require('node-osc'),
    io1  = require('socket.io').listen(8091);
var oscServer1, oscClient1;

io1.on('connection', function (socket) {
  socket.on('config', function (obj) {
    console.log('config', obj);
    oscServer1 = new osc1.Server(obj.server.port, obj.server.host);
    oscClient1 = new osc1.Client(obj.client.host, obj.client.port);

    oscClient1.send('/status', socket.id + ' connected');

    oscServer1.on('message', function(msg, rinfo) {
      socket.emit('message', msg);
      console.log('Mensajes furtivos de extracción de datos del SEGUIDOR.', msg, rinfo);
    });
  });
  socket.on('message', function (obj) {
    var toSend = obj.split(' ');
    oscClient1.send(...toSend);
    console.log('Confirmación de la colecta de la PRESENTALLA.', toSend);
  });
  socket.on("disconnect", function () {
    oscServer1.kill();
  });
});