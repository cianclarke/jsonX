var util = require('util'),
json = require('../json/fields').fields,
fields = Object.keys(json[0]), // gives us an array of the fields from a sample of the json
jsonLength = json.length,
crypto = require('crypto'),
redis = require('redis'),
hash = require('../utils/hash'),
redisClient = redis.createClient();
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
  var hash = req.params.hash;
  redisClient.get(hash, function(err, reply){
    if (reply){
      var body = JSON.parse(reply);
      res.send(generateAPIData(body));
    }else{
      res.send('No API with key ' + hash);
    }
  });
};

exports.json = function(req, res){
  var body = req.body,
  bodyString = JSON.stringify(body);

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
      res.redirect('/j/' + shortURL);
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