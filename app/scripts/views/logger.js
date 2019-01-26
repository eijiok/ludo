var Logger = function (id) {
  var messageDom = document.getElementById(id);
  var breakline = false;
  var cache = '';
  this.write = function(message) {
    console.log(message);
    cache += message;
    console.log('cache', cache);
  };

  this.writeLane = function(message) {
    console.log(message);
    messageDom.innerHTML = cache + message + '<br />' + messageDom.innerHTML ;
    cache = '';
  };
  this.reset = function(){
    console.log("reset");
    messageDom.innerHTML = "";
  };

};


