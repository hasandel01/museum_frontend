import './App.css';
import Header from './Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {WebSocketProvider} from './context/WebSocketContext'
import Showcase from './2dscene/Showcase';
import ThreeScene from './3dscene/ThreeScene';

function App() {
  return (
    <WebSocketProvider>
    <Router>
        <Header />
          <Routes>
              <Route path="/" element= {<Showcase/>} />
              <Route path="/3dscene" element= {<ThreeScene/>} />
          </Routes>
    </Router>
    </WebSocketProvider>

  );
}

export default App;
