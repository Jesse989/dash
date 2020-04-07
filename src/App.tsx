import React from 'react';
import './App.css';
import SampleChart from './SampleChart'
import NavBar from './NavBar'
import 'bootstrap/dist/css/bootstrap.min.css';
import DataParent from './DataParent';

function App() {
  return (
    <div>
      <NavBar />
      <DataParent />
    </div>
  );
}

export default App;
