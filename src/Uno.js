import React from 'react';
import {genDeck, compatibleCards} from './utils.js'
import MiniMax, {minimax} from './minimax.js'
import './Uno.css';

class Uno extends React.Component {
  constructor(props) {
    super(props);
    var numPlayers = 3
    var cardsPerPlayer = 4
    var playerHands = []
    for(var i = 0; i<=numPlayers-1; i++){
      playerHands.push([]);
    }
    this.state = { numPlayers: numPlayers, cardsPerPlayer: cardsPerPlayer, deck: [], playerHands: playerHands, turn: 0, playArea: [], minimax: {}};

    this.play = this.play.bind(this);
    this.autoPlay = this.autoPlay.bind(this);
    this.updateMinimax = this.updateMinimax.bind(this);
    this.init = this.init.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkEnded = this.checkEnded.bind(this);

  }

  init(){
    var deck = genDeck()
    var playerHands = []
    var numPlayers = this.state.numPlayers
    var cardsPerPlayer = this.state.cardsPerPlayer
    this.setState({ deck: deck}, function(){
      for(var i = 0; i<=numPlayers-1; i++){
        playerHands.push(this.getCards(cardsPerPlayer));
      }
      var playArea = this.getCards();
      this.setState({ numPlayers: numPlayers, cardsPerPlayer: cardsPerPlayer, deck: deck, playerHands: playerHands, turn: 0, playArea: playArea, minimax: {} });
    })
  }

  componentDidMount() {
 }

 handleChange(event){
   console.debug(event, event.target.name)
   var update = {}
   update[event.target.name] = +event.target.value
   this.setState(update)
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

 checkEnded(){
   console.debug(this.state.playerHands)
   return this.state.playerHands === undefined || this.state.playerHands.map(function(e){ return e.length === 0 }).reduce(function(prev, cur){ return prev || cur }, false)
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
     var played_card = minimax(compat_cards, this.state.playArea, this.state.deck, this.state.playerHands, this.state.turn, this.updateMinimax)
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
    var game_ended = this.checkEnded()
    console.debug(game_ended)
    for(var i = 0; i<this.state.numPlayers; i++){
      players.push(<Player key={i} hand={this.state.playerHands[i]} turn={this.state.turn===i} num={i}/>)
    }
    return (
      <div>
        <div className="row">
          <div className="col">
            <h2>Uno Board</h2>
          </div>
          <div className="col">
            <button className="btn-success btn" disabled={game_ended} onClick={this.play}>Play</button>
            <button className="btn-warning btn" disabled={game_ended} onClick={this.autoPlay}>Auto Play</button>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-md-2">
                <button className="btn-danger btn" onClick={this.init}>Init</button>
              </div>
              <div className="col-md-3">
                <div className="form-group form-inline">
                  <label>cards <input type="text" defaultValue={this.state.cardsPerPlayer} style={{width:"40px"}} name="cardsPerPlayer" className="form-control" onChange={this.handleChange} /></label>
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group form-inline">
                  <label>players <input type="text" defaultValue={this.state.numPlayers} style={{width:"40px"}} name="numPlayers" className="form-control" onChange={this.handleChange} /></label>
                </div>
              </div>
            </div>
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
          <div className="col-md-9">
            <MiniMax data={this.state.minimax} updateNode={this.updateMinimax} />
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
      console.log("PCARD", card)
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
        <h2 className={className}>Player {this.props.num}</h2>
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
