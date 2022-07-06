/*var http = require('http')
var server  = http.createServer((function(request,response){
	response.write(200,{"content-type":"text/plain"});
	response.end();
}))
server.listen(8080,function(){
    console.log('listening on port 8080');
})*/
var events = require('events');
var eventEmitter = new event.EventEmitter();

//create event handler
var myEventHandler = function(){
    console.log('hello guys');
}
//assign the event handler on is used as listen the event.
eventEmitter.on('great',myEventHandler)

//to fire an event:
eventEmitter.emit('great')