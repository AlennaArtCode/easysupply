import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';

// Con la versión 6+ de AWS Amplify hay que llamar a configure así:
Amplify.configure(awsConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
