var TextTableView = function(table) {
  this.table = table;
  $('.content h1').css('display','none');
  $('.game img').css('display','none');
  $('.game').css('height', 'auto');
  var $printArea = $('.game');

  this.render = function() {
    $printArea.html('');

    $printArea.append("Home: <br />")
    for (var i = 0; i < this.table.game.numberOfPlayers; i++) {
      var tokens = this.table.getTokenAtHome(i);
      $printArea.append('Jogador: ' + i);
      $printArea.append('<br/>');
      $printArea.append(this.table.printTokens(tokens));
      $printArea.append('<br/>');
    }
    
    var path = this.table.path.lanes;
    for (var i = 0; i < path.length ; i++) {
      if (i %13 == 0) {
        $printArea.append('<br />');
      }
      $printArea.append(path[i].print());
    }
    $printArea.append('<br />');
    $printArea.append('<br />');

    $printArea.append("Corredor Final: <br />")
    for (var i = 0; i < this.table.game.numberOfPlayers; i++) {
      for (var j = 0; j < this.table.finalLanes[i].lanes.length; j++) {
        $printArea.append(this.table.finalLanes[i].lanes[j].print());
      }
      $printArea.append('<br />');
    }
    $printArea.append('<br />');
    $printArea.append("Chegada: <br />")
    for (var i = 0; i < this.table.game.numberOfPlayers; i++) {
      $printArea.append("Jogador " + i + "<br />");
      for (var j = 0; j < this.table.game.numberOfTokens; j++) {
        if (this.table.tokens[i][j].position == FINAL_POS) {
          $printArea.append(j + " ")  
        }        
      }
      $printArea.append('<br />');
    }
    $printArea.append('<br />');



  };
  this.tokenValue = function(token) {
    if (! token ) {
      return ' ____ '
    }
    return ' P' +token.player + ':'+token.id + " ";
  }
};
