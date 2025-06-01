import React from 'react';
import {BrowserRouter as Router,Routes ,Route} from "react-router-dom";
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

const routes = (

  <Router>
    <Routes>
      <Route path='/dashboard' exact element = {<Home></Home>}></Route>
      <Route path='/login' exact element = {<Login></Login>}></Route>
      <Route path='/signup' exact element = {<SignUp></SignUp>}></Route>
    </Routes>
  </Router>
);

const App = () => {
  return (
    <div>
      {routes}
    </div>
  )
}

export default App