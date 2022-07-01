import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { SampleActions } from './actions';
import './App.css'

function App() {

  const dispatch = useDispatch();

  const ip = useSelector((state) => !!state.sample && state.sample.ip) || '';

  useEffect(() => {
    dispatch(SampleActions.sampleAction());
  }, []);

  return (
    <div className="App">
      <h1>Test</h1>
      <h2>{ip}</h2>
    </div>
  );
}

export default App
