'use strict';

class Main extends React.Component {
  constructor(props) {
    super(props);
    // this.state = { liked: false };
  }

  render() {
    // if (this.state.liked) {
    //   return 'You liked this.';
    // }

    return (
      // <button onClick={() => this.setState({ liked: true })}>
      //   Like
      // </button>
      <div>
        <h1>Welcome to Wumpus World</h1>
        <WumpusWorld/>
      </div>
    );
  }
}

const domContainer = document.querySelector('#react_main');
ReactDOM.render(<Main></Main>, domContainer);
