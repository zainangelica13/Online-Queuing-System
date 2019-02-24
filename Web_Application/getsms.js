var TMClient = require('textmagic-rest-client');
  
var c = new TMClient('username', 'C7XDKZOQZo6HvhJwtUw0MBcslfqwtp4');
c.Messages.send({text: 'test message', phones:'09296443068'}, function(err, res){
    console.log('Messages.send()', err, res);
});