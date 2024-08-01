import './App.css';
import Header from './Header';
import Home from './Home';
import Beacons from './Beacons';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
        <Header />
          <Routes>
              <Route path="/" element= {<Home/>} />
              <Route path="/3dscene" element= {<Beacons/>} />
          </Routes>
    </Router>
  );
}

export default App;
