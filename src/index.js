import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const api = {
    confluence: 'https://confluence/api',
    websocket:  'wss://confluence/api',
    tmdb:       'https://api.themoviedb.org',
    tmdb_image: 'https://image.tmdb.org/t/p',
}

const load = () => {
  var start = Date.now()
  console.log('loading');
  ReactDOM.render(<App api={api} />, document.getElementById('root'));
  console.log('loaded in ',Date.now() - start,'ms');
};

load();
