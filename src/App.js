import './App.css';
import Header from './Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {WebSocketProvider} from './context/WebSocketContext'
import Showcase from './2dscene/Showcase';
import ThreeScene from './3dscene/ThreeScene';
import { AlarmProvider } from './context/AlarmContext';

function App() {
  return (
    <WebSocketProvider>
      <AlarmProvider>
        <Router>
            <Header />
              <Routes>
                  <Route path="/" element= {<Showcase/>} />
                  <Route path="/3dscene" element= {<ThreeScene/>} />
              </Routes>
        </Router>
      </AlarmProvider>
    </WebSocketProvider>

  );
}

export default App;
