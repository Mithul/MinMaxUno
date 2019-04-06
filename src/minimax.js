import {genDeck, findColor, findCard, findExtra, compatibleCards} from './utils.js'
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
// import Tree from 'react-tree-graph';
// import 'react-tree-graph/dist/style.css'

Cytoscape.use(COSEBilkent);

var allCards=genDeck(false)
class MinMaxNode {
  constructor(id, type, card, curHand, visible_cards){
    this.children = {}
    this.bestCard = null
    this.knownCards = curHand.concat(visible_cards)
    this.unkownCards = allCards.slice().remove(...this.knownCards)
    this.curHand = curHand
    this.value = null
    this.type = type
    this.prob = 1
    this.card = card
    this.id = id
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

    if(Array.isArray(moves)){
      moves.forEach(function(move){
        var newHand = _this.curHand.slice().remove(move)
        var mNode = new MinMaxNode(_this.id + "_" + move, "min", move, newHand, _this.knownCards)

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
        _this.addChild(move, mNode)
      })
    }else{
      for (const [card, prob] of Object.entries(moves)) {
        // var newHand = _this.curHand.slice().remove(move)
        var mNode = new MinMaxNode(_this.id + "_" + card, "chance", card, _this.curHand, _this.knownCards)

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

  serialize(type = "nested"){
    var result = []
    if(type === "linear"){
      result.push({ data : {id: this.id, label: this.type}, position: {x: 100, y: 100}})
    }
    for (const [card, value] of Object.entries(this.children)) {
      if(type === "linear"){
        console.log("T", card)
        result = result.concat(value.serialize(type))
        result.push({data: {source: this.id, target: value.id, label: card}})
        result = [...new Set(result)]
      }else if (type === "nested") {
        result.push({name: card, children: value.serialize()})
      }
    }
    console.log("Result", this.id, result)
    return result
  }
}

export function minimax(possible_cards, card, curHand, visible_cards, callback_node){
  var root = new MinMaxNode("root", "max", card, curHand, visible_cards);
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

    data = []
    console.log("T")
    if(Object.keys(this.props.data).length !== 0){
      // data.children = this.props.data.serialize("linear")
      data = this.props.data.serialize("linear")
    }

    console.log(this.cy)
    var _this = this
    setTimeout(function(){_this.cy.layout({name: 'cose-bilkent'}).run(); console.log("done")}, 100)
    console.log("DATA", data)
    const layout = { name: 'random' };
    return (
      <div>
        <h2>MiniMax</h2>
        <CytoscapeComponent elements={data} style={{ width: '600px', height: '600px' }}  layout={layout} cy={cy => this.cy = cy}
          stylesheet={[{
              selector: 'edge',
              style: {
                'label': 'data(label)' // maps to data.label
              }
            },
            {
                selector: 'node',
                style: {
                  'label': 'data(label)' // maps to data.label
                }
            }
          ]}
        />
      </div>
    );
  }
}

export default MiniMax;
