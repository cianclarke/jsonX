var util = require('util'),
json = require('../json/fields').fields,
fields = Object.keys(json[0]), // gives us an array of the fields from a sample of the json
jsonLength = json.length,
crypto = require('crypto'),
redis = require('redis'),
hash = require('../utils/hash');


// Redis local settings, overridden below if we're running in CloudFoundry
var redisPort = 6379;
var redisHost = '127.0.0.1';
var redisPassword = '';

if (process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  var cfRedis = vcapServices['redis-2.2'][0];
  redisHost = cfRedis.credentials.hostname;
  redisPort = cfRedis.credentials.port;
  redisPassword = cfRedis.credentials.password;
}


var redisClient = redis.createClient(redisPort, redisHost);
if (process.env.VCAP_SERVICES) {
  redisClient.auth(redisPassword);
}

redisClient.on("connect", function () {
  if (process.env.VCAP_SERVICES) {
    redisClient.auth(redisPassword, function(err, res) {
      //TODO
    });
  }
});

// End CF Redis Setup

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
   title: 'jsonX',
   fields: fields
  });
};

exports.j = function(req, res){
  var hash = req.params.hash,
  restype = (req.params.restype && req.params.restype.length>0) ? req.params.restype : 'json';
  redisClient.get(hash, function(err, reply){
    if (reply){
      redisClient.incr('get_' + hash);
      var body = JSON.parse(reply);
      var data = generateAPIData(body);
      switch(restype.toLowerCase()){
        case 'json':
          res.send(data);
          break;
        case 'html':
          var first = (data.length) ? data[0] : "Preview not available for map{} data";
          res.render('api', {
            title: 'jsonX',
            preview: JSON.stringify(first),
            data: data,
            hash: hash,
            urls: [
              {
                name: 'Here\'s your new API!',
                desc: 'On this page, you\'ll find some data about how to get started with your new API. Or, if you want to skip the guide - here\'s the URL:',
                url: 'http://jsonx.cloudfoundry.com/j/' + hash + '.json'
              },
              {
                name: 'Statistics',
                desc: 'To get statistics for your application, simply drop the .JSON and add /stats to the URL:',
                url: 'http://jsonx.cloudfoundry.com/j/' + hash + '/stats'
              },
              {
                name: 'This Page',
                desc: 'To re-visit this page, simply replace .json with .html',
                url: 'http://jsonx.cloudfoundry.com/j/' + hash + '.html'
              }
            ]
          });
          break;
        default:
          res.send(data);
          break;
      }
      return;
    }else{
      res.send('No API with key ' + hash);
    }
  });
};

exports.stats = function(req, res){
  var stat = req.params.stat || 'get_' + req.params.hash;
  redisClient.get(stat, function(err, reply){
    if (err || !reply){
      res.send('No statistic found with key ' + stat);
    }else{
      res.send(reply);
    }
  });
}

exports.json = function(req, res){
  var body = req.body,
  bodyString = JSON.stringify(body);


  redisClient.incr('apis');

  // dont care about collissions - no need to hash
  /*var md5 = crypto.createHash('md5');
  md5.update(bodyString);
  var hash = md5.digest('hex');*/

  shorten(bodyString);

  function shorten(bodyString){
    var shortURL = hash();
    redisClient.get(shortURL, function(err, reply){
      if (err){
        console.error('[redis error]: ' + err.toString());
      }
      if (reply){
        return shorten(bodyString);
      }
      redisClient.set(shortURL, bodyString);
      res.redirect('/j/' + shortURL + '.html');
    });
  }


};

function generateAPIData(body){
  body.limit = parseInt(body.limit);
  var limit = (body.limit && body.limit<jsonLength) ? body.limit: 50,
  fields = body.fields || ['FirstName', 'LastName', 'Email'],
  returnType = body.type || "array";


  var data = (returnType==="array") ? [] : {};
  if (fields && fields.length>0){
    for (var i=0; (i<jsonLength && i<limit); i++){
      var ith = json[i];
      var obj = {};
      for (var j=0; j<fields.length; j++){
        var field = fields[j];
        if (ith.hasOwnProperty(field)){
          obj[field] = ith[field];
        }else if(field="FullName" && ith.FirstName && ith.LastName){
          obj['FullName'] = ith.FirstName + ' ' + ith.LastName;
        }
      }
      if (returnType==="array"){
        data.push(obj);
      }else if(returnType==="map"){
        data[i] = obj;
      }

    }
  }else{
    var data = json;
  }

  if (limit && returnType=="array"){
    data = data.slice(0, limit);
  }

  return data;
}