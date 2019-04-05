function genDeck(shuff=true){
  var cards = []
  var colors = ['R', 'G', 'B', 'Y']
  var colorCards = [0,1,2,3,4,5,6,7,8,9,'D2','Skip','Rev']
  var extras = ['W', 'WD4']

  colors.forEach(function(color){
    colorCards.forEach(function(colorCard){
      cards.push(color+':'+colorCard)
    })
  })

  extras.forEach(function(extra){
    cards.push('E:'+extra)
  })

  if(shuff){
    shuffle(cards)
  }

  return cards
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function compatibleCards(card, cards){
  console.log(card)
  var cardInfo = card.split(':')
  var card_color = cardInfo[0]
  var card_card = cardInfo[1]

  var compat_cards = cards.filter(function(cur_card){
    cardInfo = cur_card.split(':')
    var color = cardInfo[0]
    var card = cardInfo[1]
    if(color == 'E'){
      return true;
    }else if (color == card_color) {
      return true;
    }
    else if (card == card_card) {
      return true;
    }
    return false;
  })
  return compat_cards
}

function extractVector(cell){
  return [cell.includes('W'), cell.includes('S'), cell.includes('P'), cell.includes('B'), cell.includes('G')];
}

function isWumpus(cell){
  return extractVector(cell)[0]
}
function isStench(cell){
  return extractVector(cell)[1]
}
function isPit(cell){
  return extractVector(cell)[2]
}
function isBreeze(cell){
  return extractVector(cell)[3]
}
function isGold(cell){
  return extractVector(cell)[4]
}
function isGoal(cell){
  return extractVector(cell)[4]
}
