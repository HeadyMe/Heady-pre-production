import React from 'react';
import ReactDOM from 'react-dom/client';
import SplitPane from './components/SplitPane';
import './index.css';

const App = () => (
  <SplitPane left={<div>Task Queue</div>} right={<div>Context Dashboard</div>} />
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
