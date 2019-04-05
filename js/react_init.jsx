'use strict';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      // <button onClick={() => this.setState({ liked: true })}>
      <div>
        <h1>Welcome to Uno</h1>
        <Uno/>
      </div>
    );
  }
}

const domContainer = document.querySelector('#react_main');
ReactDOM.render(<Main></Main>, domContainer);
