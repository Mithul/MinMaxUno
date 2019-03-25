class WumpusWorld extends React.Component {
  constructor(props) {
    super(props);
    var size = 4;
    var world = Array(size)
    for (var i = 0; i < size; i++) {
      world[i] = new Array(size);
    }
    world = [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ]
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
    console.log(this.props.data)
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
    var cell_content = ''
    if(this.props.data == ''){
      cell_content = '';
    }else if(this.props.data == 'W'){
    }else if(this.props.data == 'S'){
    }else if(this.props.data == 'P'){
    }else if(this.props.data == 'B'){

    }
    return (
      <div className="wcell">
        {cell_content}
      </div>
    )
  }
}
