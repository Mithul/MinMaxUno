import React from 'react';
import {genDeck, compatibleCards} from './utils.js'
import MiniMax, {minimax} from './minimax.js'
import './Uno.css';

class Uno extends React.Component {
  constructor(props) {
    super(props);
    var deck = genDeck()
    var playerHands = []
    var numPlayers = 3
    var cardsPerPlayer = 2
    this.state = { numPlayers: numPlayers, cardsPerPlayer: cardsPerPlayer, deck: deck, playerHands: playerHands};
    for(var i = 0; i<=numPlayers-1; i++){
      playerHands.push(this.getCards(cardsPerPlayer));
    }
    var playArea = this.getCards();
    this.state = { numPlayers: numPlayers, cardsPerPlayer: cardsPerPlayer, deck: deck, playerHands: playerHands, turn: 0, playArea: playArea, minimax: {} };
    // console.log(this.state.world)

    this.play = this.play.bind(this);
    this.autoPlay = this.autoPlay.bind(this);
    this.updateMinimax = this.updateMinimax.bind(this);

  }

  componentDidMount() {
 }

 getCards(numCards=1){
   return this.state.deck.splice(0, numCards)
 }

 autoPlay(){
   setInterval(this.play,1000)
 }

 updateMinimax(node){
   this.setState({minimax: node})
 }

 play(){
   console.log("Playing")
   var cur_card = this.state.playArea[this.state.playArea.length-1]
   var nextTurn = (this.state.turn + 1)%this.state.numPlayers
   var playerHands = this.state.playerHands
   var curHand = this.state.playerHands[this.state.turn]
   var playArea = this.state.playArea

   var compat_cards = compatibleCards(cur_card, curHand)
   console.log(compat_cards, curHand)

   if(compat_cards.length === 0){
     var aCard = this.getCards()
     curHand = curHand.concat(aCard)
   }else{
     var played_card = minimax(compat_cards, cur_card, playerHands, this.state.turn, this.state.numPlayers, this.updateMinimax)
     curHand.remove(played_card)
     playArea.push(played_card)

     if(played_card.split(":")[0] === "E"){
       playArea.push("R:C") // TODO : Change to color changing logic
     }
   }

   playerHands[this.state.turn] = curHand
   console.log(playerHands, curHand)
   this.setState({turn: nextTurn, playerHands: playerHands, playArea: playArea})
 }

  render() {
    var players = []
    for(var i = 0; i<this.state.numPlayers; i++){
      players.push(<Player key={i} hand={this.state.playerHands[i]} turn={this.state.turn===i}/>)
    }
    return (
      <div>
        <div className="row">
          <div className="col">
            <h2>Uno Board</h2>
          </div>
          <div className="col">
            <button onClick={this.play}>Play</button>
            <button onClick={this.autoPlay}>Auto Play</button>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Deck cards={this.state.deck}/>
          </div>
          <div className="col">
            <PlayArea cards={this.state.playArea}/>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            {players}
          </div>
          <div className="col">
            <MiniMax data={this.state.minimax}/>
          </div>
        </div>
      </div>
    );
  }
}

class Deck extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    var cards = this.props.cards.map(function(card){
      return (<Card card={card} key={card}/>)
    })
    return (
      <div>
        <h2>Deck</h2>
        {cards}
      </div>
    );
  }
}

class PlayArea extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    var cards = this.props.cards.map(function(card){
      return (<Card card={card} key={card}/>)
    })
    return (
      <div>
        <h2>Play Area</h2>
        {cards}
      </div>
    );
  }
}

class Player extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // this.state = { world: world };
  // }

  render() {
    var cards = this.props.hand.map(function(card){return (<Card card={card} key={card}/>)})
    var className = ""
    if(this.props.turn)
      className = "active"
    return (
      <div>
        <h2 className={className}>Player</h2>
        {cards}
      </div>
    );
  }
}

class Card extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // this.state = { world: world };
  // }

  render() {
    var className = "unoCard "
    var cardInfo = this.props.card.split(":")
    var color = cardInfo[0]
    var card = cardInfo[1]
    className += color + " ";
    className += card + " ";
    return (
      <div className={className}>
        {card}
      </div>
    );
  }
}


export default Uno;
