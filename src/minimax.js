import {genDeck, findColor, findCard, findExtra, compatibleCards, gradient} from './utils.js'
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
import React from 'react';
import ReactDOM from 'react-dom';
import CytoscapeComponent from 'react-cytoscapejs';
// import Tree from 'react-tree-graph';
// import 'react-tree-graph/dist/style.css'

Cytoscape.use(COSEBilkent);
Cytoscape.use( dagre );

var allCards=genDeck(false)
var BreakException = {};
var knownCards = [null]
var unknownCards = [null]
class MinMaxNode {
  constructor(id, type, card, curHand, visible_cards){
    this.children = {}
    this.bestCard = null
    // this.knownCards = knownCards // [...new Set(curHand.concat(visible_cards))]
    // this.unknownCards = unknownCards // allCards.slice().remove(...this.knownCards)
    this.curHand = curHand
    this.type = type
    this.prob = 1
    this.card = card
    this.id = id

    if(this.type === "min"){
      this.value = Number.MAX_VALUE
    }else if (this.type === "max") {
      this.value = -Number.MAX_VALUE
    }else if (this.type === "chance") {
      this.value = 0
    }
  }

  setProb(prob){
    this.prob = prob
  }

  addChild(card, node){
    this.children[card] = node
  }

  updateValue(child){
    var bestMove = null
    if(this.type === "min"){
      if(this.value > child.value){
        bestMove = child.card
        this.value = child.value
      }
    }else if (this.type === "max") {
      if(this.value < child.value){
        bestMove = child.card
        this.value = child.value
      }
    }else if (this.type === "chance") {
        this.value += child.value*child.prob
    }
    return bestMove
  }

  findBest(moves, alpha=-Number.MAX_VALUE, beta=Number.MAX_VALUE){
    if(this.curHand.length === 0){
      this.value = 1
      return
    }

    if(this.id.split("_").length > 6){
      this.value = -1
      console.log("Truncated")
      return
    }
    var bestMove = moves[0]

    try {
      if(Array.isArray(moves)){
        moves.forEach((move) => {
          var newHand = this.curHand.slice().remove(move)
          var mNode = new MinMaxNode(this.id + "_" + move, "chance", move, newHand, knownCards)

          var chance_moves = {}
          var p = 0

          var colors = ['R', 'G', 'B', 'Y']
          var colorCards = [0,1,2,3,4,5,6,7,8,9,'D2','Skip','Rev']

          console.log(unknownCards)
          colors.forEach((color) => {
            chance_moves[color + ":*"] = findColor(color,unknownCards).length/(2*unknownCards.length)
          })

          colorCards.forEach((colorCard) => {
            chance_moves["*:" + colorCard] = findCard(colorCard + "",unknownCards).length/(2*unknownCards.length)
          })

          // chance_moves[move.split(":")[0] + ":*"] = findColor(move.split(":")[0],_unknownCards).length/_unknownCards.length
          // chance_moves["*:" + move.split(":")[1]] = findCard(move.split(":")[1],_unknownCards).length/_unknownCards.length
          chance_moves["E:*"] = findExtra(unknownCards).length/unknownCards.length
          for (var key in chance_moves) {
            if(!isNaN(chance_moves[key]))
            p += chance_moves[key];
            // console.log("PROB SUM", p, key)
          }
          // chance_moves["*:*"] = 1.0 - p
          mNode.findBest(chance_moves, alpha, beta)

          var suggested_move = this.updateValue(mNode)
          if(suggested_move !== null)
            bestMove = suggested_move
          if(this.type === "min"){
            alpha = Math.max(alpha, this.value)
          }else if (this.type === "max") {
            beta = Math.min(beta, this.value)
          }

          if(alpha >= beta)
            throw BreakException;
          this.addChild(move, mNode)
        })
      }else{
        for (const [card, prob] of Object.entries(moves)) {
          var mNode = new MinMaxNode(this.id + "_" + card, "max", card, this.curHand, knownCards)

          mNode.prob = prob
          var compat_cards = compatibleCards(card, this.curHand)
          if(compat_cards.length === 0){
            mNode.value = -1
          }else{
            // console.log("NO COMPATIBLE CARDS")
            mNode.findBest(compat_cards, alpha, beta)

            var suggested_move = this.updateValue(mNode)
            if(suggested_move !== null)
              bestMove = suggested_move
            if(this.type === "min"){
              alpha = Math.max(alpha, this.value)
            }else if (this.type === "max") {
              beta = Math.min(beta, this.value)
            }

            if(alpha >= beta)
              throw BreakException;
          }
          this.addChild(card, mNode)
        }
      }
    }catch (e) {
      console.log("Cutoff", e)
      if (e !== BreakException) throw e;
    }
    this.alpha = alpha
    this.beta = beta
    console.log("AB", alpha, beta, this.id)
    // this.value = Math.round(this.value * 1000) / 1000

    return bestMove
  }

  serialize(type = "nested"){
    var result = []
    var color = "#ccc"
    if(type === "linear"){
      var nodeType = "ellipse"
      if(this.type === "max"){
        nodeType = "triangle"
      }else if (this.type === "min") {
        nodeType = "vee"
      }
      result.push({ data : {id: this.id, label: Math.round(this.value * 1000) / 1000, type: nodeType}, position: {x: 100, y: 100}})
    }
    for (const [card, value] of Object.entries(this.children)) {
      if(type === "linear"){
        // console.log("T", card)
        if(this.id.split("_").length < 4){
          result = result.concat(value.serialize(type))
          if(this.value === value.value){
            // color = "#B71C1C" // RED
            color = "#1B5E20"
          }else{
            color = gradient("#B71C1C", "#1B5E20", value.prob*100)
            console.log(color, value.prob)
          }
          result.push({data: {source: this.id, target: value.id, label: card, color: color}})
          result = [...new Set(result)]
        }
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
  knownCards = [...new Set(curHand.concat(visible_cards))]
  unknownCards = allCards.slice().remove(...knownCards)
  console.log(knownCards, unknownCards)
  var move = root.findBest(possible_cards)

  callback_node(root)
  return move
}


class MiniMax extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0 };
  }

  componentDidMount() {
    this.updateWindowDimensions();
  }

  updateWindowDimensions() {
    var rect = ReactDOM.findDOMNode(this).getBoundingClientRect()
    this.setState({ width: rect.width, height: rect.height - 50});
  }

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
    setTimeout(function(){_this.cy.layout({name: 'dagre'}).run(); console.log("done")}, 100)
    console.log("DATA", data)
    const layout = { name: 'random' };
    return (
      <div style={{height: "100%"}}>
        <h2>MiniMax</h2>
        <CytoscapeComponent elements={data} style={{ width: this.state.width + 'px', height: this.state.height + 'px' }}  layout={layout} cy={cy => this.cy = cy}
          stylesheet={[{
              selector: 'edge',
              style: {
                'line-color': 'data(color)',
                'label': 'data(label)' // maps to data.label
              }
            },
            {
                selector: 'node',
                style: {
                  "shape": "data(type)",
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
