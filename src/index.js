import React from 'react';
import ReactDOM from 'react-dom';


import './index.css';

import App from './App';

const API_HTTP_PROTO= 'https://'
const API_WS_PROTO= 'wss://'
const API_HOSTPATH = 'confluence/api'

const API_HTTP = API_HTTP_PROTO+API_HOSTPATH
const API_WS= API_WS_PROTO+API_HOSTPATH

export const load = () => {
  var start = Date.now()
  console.log('loading');
  ReactDOM.render(<App api_http={API_HTTP} api_ws={API_WS} />, document.getElementById('root'));
  console.log('loaded in ',Date.now() - start,'ms');
};

load();
