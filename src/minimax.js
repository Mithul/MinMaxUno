import {compatibleCards, gradient}   from './utils.js'
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
var MAX_DEPTH = 200
var MAX_VISIBLE_DEPTH = 10
var PRUNED_VALUE = "NA"


// var allCards=genDeck(false)
var BreakException = {};
// var knownCards = [null]
// var unknownCards = [null]

console.log = function(){}

class State {
  constructor(playArea, deck, playerHands, turn){
    this.playArea = playArea.slice()
    this.deck = deck.slice()
    this.playerHands = playerHands.slice()
    this.turn = turn

    this.numPlayers = this.playerHands.length
    this.card = this.playArea[this.playArea.length - 1]
  }

  equals(state){
    return (state.turn === this.turn &&
      JSON.stringify(state.playArea) === JSON.stringify(this.playArea) &&
      JSON.stringify(state.deck) === JSON.stringify(this.deck) &&
      JSON.stringify(state.playerHands) === JSON.stringify(this.playerHands))
  }

  copy(){
    return new State(this.playArea, this.deck, this.playerHands, this.turn)
  }
}
class MinMaxNode {
  // var root = new MinMaxNode("root", card, playerHands, turn, numPlayers);
  constructor(id, type, state, player, card, parent){
    this.children = {}
    this.bestCard = null
    this.card = card
    // this.knownCards = knownCards // [...new Set(curHand.concat(visible_cards))]
    // this.unknownCards = unknownCards // allCards.slice().remove(...this.knownCards)
    this.type = type
    this.prob = 1
    this.id = id
    this.state = state
    this.player = player

    this.parent = parent

    this.pruned = false

    if(parent){
      this.prune = parent.prune
    }else{
      this.prune = true
    }

    if(this.state.turn === this.player){
      this.type = "max"
    }else{
      this.type = "min"
    }
    console.log(state, this.state)
    this.curHand = this.state.playerHands[this.state.turn]

    if(this.type === "min"){
      // this.value = new Array(this.state.numPlayers).fill(Number.MAX_VALUE)
      // this.value = new Array(this.state.numPlayers).fill(1)
      this.value = Number.MAX_VALUE
    }else if (this.type === "max") {
      // this.value = new Array(this.state.numPlayers).fill(-Number.MAX_VALUE)
      // this.value = new Array(this.state.numPlayers).fill(-5)
      this.value = -Number.MAX_VALUE
    }else if (this.type === "chance") {
      this.value = 0
    }
    console.log("Created Node", this)
  }

  getLabel(print_children = false){
    var children = ""
    if(print_children){
      children = " " + this.count_children()
    }
    if(!this.pruned){
      return "P" + this.state.turn + " : " + Math.round(this.value * 1000) / 1000 + children
    }else{
      return "P" + this.state.turn + " : pruned"
    }
  }

  setProb(prob){
    this.prob = prob
  }

  addChild(card, node){
    this.children[card] = node
  }

  count_children(){
      var c = 0 ; //console.debug(node, Object.keys(node.children).length) ;
      for (const value of Object.values(this.children)) {
  			c+= 1 + value.count_children()
      }
      return c
  }

  get_root(){
    if(this.parent === null) return this
    return this.parent.get_root()
  }

  updateValue(child){
    var bestMove = null
    if(this.type === "min"){
      if(this.value > child.value){
        bestMove = child.card
        this.value = child.value
      }
    }else if (this.type === "max") {
      if(this.value <= child.value){
        bestMove = child.card
        this.value = child.value
      }
    }else if (this.type === "chance") {
        this.value += child.value*child.prob
    }
    return bestMove
  }

  find(id){
    if(this.id === id){
      return this
    }
    for (const [card, value] of Object.entries(this.children)) {
      var x = value.find(id)
      if(x!==null){
        return x
      }
    }
    return null
  }

  findBest(moves, alpha=-Number.MAX_VALUE, beta=Number.MAX_VALUE){
    if(this.curHand.length === 0){
      this.value = 1
      return
    }
    // if(moves.length === 0){
      // this.value = -1
    // }
    if(this.id.split("_").length > MAX_DEPTH){
      this.value = -3
      console.log("Truncated")
      return
    }
    var bestMove = moves[0]
    var nextTurn = (this.state.turn + 1)%this.state.numPlayers

    try {
      if(moves.length === 0){
        // this.type = "chance"
        console.log("Drawing card for ", this, this.state.deck)
        var newHand = this.curHand.slice()
        var newDeck = this.state.deck.slice()
        var newPlayArea = this.state.playArea.slice()
        if(newDeck.length === 0){
          this.value = 0
          return
          // newDeck = this.state.playArea.slice()
          // newPlayArea = [newPlayArea[0]]
        }
        var move = newDeck.splice(0, 1)
        newHand.push(move[0])
        var newPlayerHands = this.state.playerHands.slice()
        newPlayerHands[this.state.turn] = newHand
        // var newPlayArea = this.state.playArea.slice()
        // newPlayArea.push(move)
        var mNode = new MinMaxNode(this.id + "_" + move, "max", new State(newPlayArea, newDeck, newPlayerHands, nextTurn), this.player, move[0], this)

        console.log("checking compat",this,nextTurn, newPlayerHands)
        var compat_cards = compatibleCards(this.state.card, newPlayerHands[nextTurn])

        console.log("Finding the best for1 ", mNode, compat_cards)
        if(!this.pruned){
          mNode.findBest(compat_cards, alpha, beta)

          var suggested_move = this.updateValue(mNode)
          if(suggested_move !== null)
            bestMove = suggested_move
          if(this.type === "min"){
            alpha = Math.max(alpha, this.value)
          }else if (this.type === "max") {
            beta = Math.min(beta, this.value)
          }
        }else{
          mNode.value = PRUNED_VALUE
          mNode.pruned = true
        }
        //
        console.log("Adding child ", mNode)
        this.addChild(move, mNode)
        if(alpha >= beta && this.prune)
          this.pruned = true
          // throw BreakException;
      }else{
        console.log("Arr ", this, moves)
        if(Array.isArray(moves)){
          moves.forEach((move) => {
            var newHand = this.curHand.slice().remove(move)
            if(newHand.length === 0 ){
              if(this.player === this.state.turn){
                this.value = 1
              }else{
                this.value = -10
              }
              return
            }
            // constructor(id, type, card, playerHands, turn, numPlayers){
            var newPlayerHands = this.state.playerHands.slice()
            newPlayerHands[this.state.turn] = newHand
            var newPlayArea = this.state.playArea.slice()
            newPlayArea.push(move)

            if(move.split(":")[1] === "Skip"){
              nextTurn = (nextTurn + 1)%this.state.numPlayers
            }

            var mNode = new MinMaxNode(this.id + "_" + move, "max", new State(newPlayArea, this.state.deck, newPlayerHands, nextTurn), this.player, move, this)

            // var chance_moves = {}
            // var p = 0
            //
            // console.log(unknownCards)
            // COLOR.forEach((color) => {
            //   chance_moves[color + ":*"] = findColor(color,unknownCards).length/(2*unknownCards.length)
            // })
            //
            // COLOR_CARDS.forEach((colorCard) => {
            //   chance_moves["*:" + colorCard] = findCard(colorCard + "",unknownCards).length/(2*unknownCards.length)
            // })
            //
            // // chance_moves[move.split(":")[0] + ":*"] = findColor(move.split(":")[0],_unknownCards).length/_unknownCards.length
            // // chance_moves["*:" + move.split(":")[1]] = findCard(move.split(":")[1],_unknownCards).length/_unknownCards.length
            // chance_moves["E:*"] = findExtra(unknownCards).length/unknownCards.length
            // for (var key in chance_moves) {
              // if(!isNaN(chance_moves[key]))
              // p += chance_moves[key];
              // console.log("PROB SUM", p, key)
            // }
            // chance_moves["*:*"] = 1.0 - p
            var compat_cards = compatibleCards(move, newPlayerHands[nextTurn])

            console.log("Finding the best for ", mNode, compat_cards)
            if(!this.pruned){
              mNode.findBest(compat_cards, alpha, beta)

              var suggested_move = this.updateValue(mNode)
              if(suggested_move !== null)
                bestMove = suggested_move
              if(this.type === "min"){
                alpha = Math.max(alpha, this.value)
              }else if (this.type === "max") {
                beta = Math.min(beta, this.value)
              }
            }else{
              mNode.value = PRUNED_VALUE
              mNode.pruned = true
            }
            //
            console.log("Adding child ", mNode)
            this.addChild(move, mNode)
            if(alpha >= beta && this.prune)
              this.pruned = true
              // throw BreakException;
          })
        }else{
          // for (const [card, prob] of Object.entries(moves)) {
          //   var mNode = new MinMaxNode(this.id + "_" + card, "max", card, this.curHand, knownCards)
          //
          //   mNode.prob = prob
          //   var compat_cards = compatibleCards(card, this.curHand)
          //   if(compat_cards.length === 0){
          //     mNode.value = -1
          //   }else{
          //     // console.log("NO COMPATIBLE CARDS")
          //     mNode.findBest(compat_cards, alpha, beta)
          //
          //     var suggested_move = this.updateValue(mNode)
          //     if(suggested_move !== null)
          //       bestMove = suggested_move
          //     if(this.type === "min"){
          //       alpha = Math.max(alpha, this.value)
          //     }else if (this.type === "max") {
          //       beta = Math.min(beta, this.value)
          //     }
          //
          //     if(alpha >= beta)
          //       throw BreakException;
          //   }
          //   this.addChild(card, mNode)
          // }
        }
      }
    }catch (e) {
      console.log("Cutoff", e)
      this.pruned = true
      if (e !== BreakException) throw e;
    }
    this.pruned = false
    this.alpha = alpha
    this.beta = beta
    console.log("AB", alpha, beta, this.id)
    // this.value = Math.round(this.value * 1000) / 1000

    return bestMove
  }

  serialize(type = "nested", depth=0){
    // console.debug(depth)
    var result = []
    var color = "#ccc"
    if(type === "linear"){
      var nodeType = "ellipse"
      if(this.type === "max"){
        nodeType = "triangle"
      }else if (this.type === "min") {
        nodeType = "vee"
      }
      var nodeColor = "#666"
      if(this.pruned){
        nodeColor = "#B71C1C"
      }

      result.push({ data : {id: this.id, label: this.getLabel(depth >= MAX_VISIBLE_DEPTH), type: nodeType, color: nodeColor}, position: {x: 100, y: 100}})
    }
    for (const [card, value] of Object.entries(this.children)) {
      if(type === "linear"){
        // console.log("T", card)
        if(depth < MAX_VISIBLE_DEPTH){
          result = result.concat(value.serialize(type, depth + 1))
          if(this.value === value.value){
            // color = "#B71C1C" // RED
            color = "#1B5E20"
          }else{
            color = gradient("#B71C1C", "#1B5E20", 0)
            console.log(color, value.prob)
          }
          result.push({data: {source: this.id, target: value.id, label: card, color: color}})
          result = [...new Set(result)]
        }
      }else if (type === "nested") {
        result.push({name: card, children: value.serialize(type, depth + 1)})
      }
    }
    console.log("Result", this.id, result)
    return result
  }
}



export function minimax(possible_cards, playArea, deck, playerHands, turn, callback_node){
  // var played_card = minimax(compat_cards, cur_card, playerHands, this.state.turn, this.state.numPlayers, this.updateMinimax)
  // console.log([possible_cards, card, playerHands, turn, numPlayers, callback_node])
  var start_state = new State(playArea, deck, playerHands, turn)
  console.log(start_state)
  var root = new MinMaxNode("root", "max", start_state, turn, null, null);
  // possible_cards.map(function(card){
    // root.addChild(card, new MinMaxNode)
  // })

  console.debug("Node", root, root.count_children())
  // knownCards = [...new Set(playerHands.flat())]
  // unknownCards = allCards.slice().remove(...knownCards)
  console.time('someFunction');
  var move = root.findBest(possible_cards)
  console.timeEnd('someFunction')
  console.debug("Node", root, root.count_children())

  callback_node(root)
  return move
}


class MiniMax extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0, root: {}};

    this.reset = this.reset.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions();
  }

  updateWindowDimensions() {
    var rect = ReactDOM.findDOMNode(this).getBoundingClientRect()
    this.setState({ width: rect.width, height: window.innerHeight - rect.y - 120});
  }

  reset(){
    this.props.updateNode(this.props.data.get_root())
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
    if(this.cy !== undefined){
      this.cy.on('click', 'node', function(evt){
        console.log( 'clicked ' + this.id() );
        var selected_node = _this.props.data.find(this.id())
        console.debug(selected_node, _this.props.data)
        // if(_this.props.data.id === selected_node.id){
          // selected_node = selected_node.get_root()
        // }
        _this.props.updateNode(selected_node)
      });
    }
    setTimeout(function(){_this.cy.layout({name: 'dagre'}).run(); console.log("done")}, 100)
    console.log("DATA", data)
    const layout = { name: 'random' };
    var children = 0
    if(this.props.data instanceof MinMaxNode){
      children = this.props.data.count_children()
    }
    return (
      <div style={{height: "100%"}}>
        <h2>MiniMax : {children} &nbsp;&nbsp;&nbsp;
        <button className="btn btn-info" onClick={this.reset}>Reset Graph</button></h2>
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
                  'background-color': 'data(color)',
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
