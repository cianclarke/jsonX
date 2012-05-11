var util = require('util'),
json = require('../json/fields').fields,
fields = Object.keys(json[0]), // gives us an array of the fields from a sample of the json
jsonLength = json.length,
crypto = require('crypto'),
redis = require('redis'),
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
      req.body = JSON.stringify(reply);
      exports.json(req, res);
    }else{
      res.send('No API with key ' + hash);
    }
  });
};

exports.json = function(req, res){
  var body = req.body,
  bodyString = JSON.stringify(body);
  limit = (body.limit && body.limit<jsonLength) ? body.limit : 50,
  fields = body.fields || ['FirstName', 'LastName', 'Email'],
  returnType = body.type || "array";

  var md5 = crypto.createHash('md5');
  md5.update(bodyString);
  var hash = md5.digest('hex');

  redisClient.get(hash, function(err, reply){
    if (err){
      console.error('[redis error]: ' + err.toString());
    }
    if (!reply){
      redisClient.set(hash, bodyString);
    }
  });

  
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
  
  
  
  res.send(data);
};