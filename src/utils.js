/* eslint no-extend-native: ["error", { "exceptions": ["Array"] }] */

export function genDeck(shuff=true){
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

export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function findCard(card, deck){
  return deck.filter(function(cur_card){ return cur_card.split(":")[1] === card })
}

export function findColor(color, deck){
  return deck.filter(function(cur_card){ return cur_card.split(":")[0] === color })
}

export function findExtra(deck){
  return findColor("E", deck)
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    var op_arr = this;
    while (L && op_arr.length) {
        what = a[--L];
        while ((ax = op_arr.indexOf(what)) !== -1) {
            op_arr.splice(ax, 1);
        }
    }
    return op_arr;
};

export function compatibleCards(card, cards){
  var cardInfo = card.split(':')
  var card_color = cardInfo[0]
  var card_card = cardInfo[1]

  var compat_cards = cards.filter(function(cur_card){
    cardInfo = cur_card.split(':')
    var color = cardInfo[0]
    var card = cardInfo[1]
    if(color === 'E'){
      return true;
    }else if (color === card_color) {
      return true;
    }
    else if (card === card_card) {
      return true;
    }
    return false;
  })
  return compat_cards
}
