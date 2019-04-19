/* eslint no-extend-native: ["error", { "exceptions": ["Array"] }] */
export var COLOR = ['R', 'G', 'B', 'Y']
export var COLOR_CARDS = [0,1,2,3,4]//,5,6,7,8,9]//,'D2','Skip','Rev']

export function genDeck(shuff=true){
  var cards = []
  var extras = []//'W', 'WD4']

  COLOR.forEach(function(color){
    COLOR_CARDS.forEach(function(colorCard){
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

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var result1 = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } :  {
    r: parseInt(result1[1], 16)*16,
    g: parseInt(result1[2], 16)*16,
    b: parseInt(result1[3], 16)*16
  };
}

function map(value, fromSource, toSource, fromTarget, toTarget) {
  return (value - fromSource) / (toSource - fromSource) * (toTarget - fromTarget) + fromTarget;
}

export function gradient(startColour, endColour, value, min=0, max=100) {
  var startRGB = hexToRgb(startColour);
  var endRGB = hexToRgb(endColour);
  var percentFade = map(value, min, max, 0, 1);
  percentFade = Math.pow(percentFade, 1.0/8)

  var diffRed = endRGB.r - startRGB.r;
  var diffGreen = endRGB.g - startRGB.g;
  var diffBlue = endRGB.b - startRGB.b;

  diffRed = (diffRed * percentFade) + startRGB.r;
  diffGreen = (diffGreen * percentFade) + startRGB.g;
  diffBlue = (diffBlue * percentFade) + startRGB.b;

  var result = "rgb(" + Math.round(diffRed) + ", " + Math.round(diffGreen) + ", " + Math.round(diffBlue) + ")";
  return result;
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
