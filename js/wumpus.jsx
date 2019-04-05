class WumpusWorld extends React.Component {
  constructor(props) {
    super(props);
    var size = 10;
    var world = randomWorld(size)
    this.state = { world: world };
    console.log(this.state.world)
  }

  render() {
    var rows = this.state.world.map((row, i) =>
      <WumpusRow data={row} key={i}/>
    );
    return (
      <div>
        <h2>Wumpus Board</h2>
        {rows}
      </div>
    );
  }
}

class WumpusRow extends React.Component {
  constructor(props) {
    super(props);
    // console.log()
  }

  render() {
    // console.log(this.props.data)
    var columns = this.props.data.map((col, i) =>
      <WumpusCell key={i} data={col}/>
    );
    return (
      <div>
        {columns}
      </div>
    );
  }
}

class WumpusCell extends React.Component {
  constructor(props) {
    super(props);
    // console.log()
  }

  render() {
    var cell_content = '', wumpus = '', stench = '', pit = '', breeze = '', gold = '';
    if(this.props.data == ''){
      cell_content = '';
    }if(isWumpus(this.props.data)){
      wumpus= (<i className="fa fa-skull"></i>)
    }if(isStench(this.props.data)){
      stench= (<i className="fa fa-exclamation-triangle"></i>)
    }if(isPit(this.props.data)){
      pit= (<i className="far fa-circle"></i>)
    }if(isBreeze(this.props.data)){
      breeze= (<i className="fa fa-wind"></i>)
    }if(isGold(this.props.data)){
      gold= (<i className="fa fa-flag"></i>)
    }
    // console.log(this.props.data, "C", isGold(this.props.data))
    return (
      <div className="wcell">
        {wumpus}
        {stench}
        {pit}
        {breeze}
        {gold}
      </div>
    )
  }
}
