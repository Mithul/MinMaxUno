'use strict';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      // <button onClick={() => this.setState({ liked: true })}>
      <div>
        <h1>Welcome to Wumpus World</h1>
        <WumpusWorld/>
      </div>
    );
  }
}

const domContainer = document.querySelector('#react_main');
ReactDOM.render(<Main></Main>, domContainer);
