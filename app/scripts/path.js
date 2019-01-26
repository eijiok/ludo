/* depends on block.js*/

var Path = function(pathSize) {
  this.lanes = [];
  for (var i = 0; i < pathSize; i++) {
    this.lanes[i] = new Block(i);
  }

  this.canWalk = function (position){
    var block = this.lanes[position];
    return block.canAdd();
  };
  this.add = function (token, position){
    var block = this.lanes[position];
    return block.add(token);
  };
  this.remove = function (token, position) {
    var block = this.lanes[position];
    return block.remove(token);
  };
};


