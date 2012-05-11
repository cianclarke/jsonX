var hash = function(callback){

  // Simple random number generator helper
  var randomRange = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  var newHash = "";
  // 6 digits, alphanumeric
  for (var i = 0; i < 6; i++){
    var digit;
    if (randomRange(0,1) === 0){
      digit = String(randomRange(0,9));
    }else{
      digit = String.fromCharCode(randomRange(97,122));
    }
    newHash = newHash + digit;
  }
  if (callback){
    callback(newHash);
  }
  return newHash;
};

module.exports = hash;