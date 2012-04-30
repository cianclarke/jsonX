var util = require('util'),
json = require('../json/fields').fields,
jsonLength = json.length;
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'jsonX' });
};

exports.json = function(req, res){
  var body = req.body,
  limit = (body.limit && body.limit<jsonLength) ? body.limit : 50,
  fields = body.fields || [];
  
  var data = [];
  if (fields && fields.length>0){
    for (var i=0; i<jsonLength; i++){
      var ith = json[i];
      var obj = {};
      for (var j=0; j<fields.length; j++){
        var field = fields[j];
        if (ith.hasOwnProperty(field)){
          obj[field] = ith[field];
        }
      }
      data.push(obj);
    }
  }else{
    var data = json;
  }
  
  if (limit){
    data = data.slice(0, limit);
  }
  
  
  
  res.send(data);
}