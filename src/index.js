import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Uno from './Uno';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Uno />, document.getElementById('react_main'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
