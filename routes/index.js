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
  
  
  
  res.send(data);
}