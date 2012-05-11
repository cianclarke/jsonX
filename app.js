
/**
 * Module dependencies.
 */

var express = require('express'),
routes = require('./routes'),
http = require('http');

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.post('/json', routes.json);

app.get('/j/:hash', routes.j);


http.createServer(app).listen(process.env.VCAP_APP_PORT || 3000);

console.log("Express server listening on port 3000");
