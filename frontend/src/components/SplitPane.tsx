import React, { ReactNode } from 'react';
import './SplitPane.css';

type SplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
};

const SplitPane: React.FC<SplitPaneProps> = ({ left, right }) => {
  return (
    <div className="split-pane">
      <div className="split-pane-left">{left}</div>
      <div className="split-pane-right">{right}</div>
    </div>
  );
};

export default SplitPane;
