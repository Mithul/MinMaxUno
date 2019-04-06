import {genDeck, findColor, findCard, findExtra, compatibleCards} from './utils.js'
import React from 'react';
import Tree from 'react-tree-graph';
import 'react-tree-graph/dist/style.css'

var allCards=genDeck(false)
class MinMaxNode {
  constructor(type, card, curHand, visible_cards){
    this.children = {}
    this.bestCard = null
    console.log(type, curHand, visible_cards)
    this.knownCards = curHand.concat(visible_cards)
    this.unkownCards = allCards.slice().remove(...this.knownCards)
    this.curHand = curHand
    this.value = null
    this.type = type
    this.prob = 1
    this.card = card
  }

  setProb(prob){
    this.prob = prob
  }

  addChild(card, node){
    this.children[card] = node
  }

  findBest(moves){
    if(this.curHand.length === 0){
      this.value = 1
    }
    var _this = this

    console.log("NODE", _this.card, moves)
    if(Array.isArray(moves)){
      moves.forEach(function(move){
        var newHand = _this.curHand.slice().remove(move)
        var mNode = new MinMaxNode("min", move, newHand, _this.knownCards)

        var chance_moves = {}
        var p = 0
        chance_moves[move.split(":")[0] + ":*"] = findColor(move.split(":")[0],_this.unkownCards).length/_this.unkownCards.length
        chance_moves["*:" + move.split(":")[1]] = findCard(move.split(":")[1],_this.unkownCards).length/_this.unkownCards.length
        chance_moves["E:*"] = findExtra(_this.unkownCards).length/_this.unkownCards.length
        for (var key in chance_moves) {
          if(!isNaN(chance_moves[key]))
            p += chance_moves[key];
        }
        chance_moves["*:*"] = 1.0 - p
        mNode.findBest(chance_moves)
        console.log(chance_moves, mNode)
        _this.addChild(move, mNode)
      })
    }else{
      console.log("NODE1", _this.card, moves)
      for (const [card, prob] of Object.entries(moves)) {
        // var newHand = _this.curHand.slice().remove(move)
        var mNode = new MinMaxNode("chance", card, _this.curHand, _this.knownCards)

        // var chance_moves = []
        // chance_moves.push(move.split(":")[0] + ":*")
        // chance_moves.push("*:" + move.split(":")[1])
        // chance_moves.push("*:*")
        // chance_moves.push("E:*")
        mNode.findBest(compatibleCards(card, _this.curHand))
        _this.addChild(card, mNode)
      }
    }

    return moves[0]
  }

  serialize(){
    var result = []
    for (const [card, value] of Object.entries(this.children)) {
      result.push({name: card, children: value.serialize()})
    }
    console.log(result)
    return result
  }
}

export function minimax(possible_cards, card, curHand, visible_cards, callback_node){
  var root = new MinMaxNode("max", card, curHand, visible_cards);
  // possible_cards.map(function(card){
    // root.addChild(card, new MinMaxNode)
  // })

  console.log("Node", root)

  var move = root.findBest(possible_cards)

  callback_node(root)
  return move
}


class MiniMax extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    var data = {
    	name: 'Start',
    	children: []
    };

    if(Object.keys(this.props.data).length !== 0){
      console.log(this.props.data)
      data.children = this.props.data.serialize()
    }

    console.log("DATA", data)

    return (
      <div>
        <h2>MiniMax</h2>
        <Tree
          	data={data}
          	height={400}
          	width={400}/>
      </div>
    );
  }
}

export default MiniMax;
