import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Link, withRouter, Switch } from 'react-router-dom'
import * as actions from '../../action_creators';
import * as reducers from '../../reducers';
import SignIn from '../../containers/Authentication/SignIn'
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import K from '../../constants/';
import AuthenticationContainer from "../Authentication/AuthenticationContainer.js";
import ClubContainer from "../Club/ClubContainer.js";
import NotFound from "../../components/Generic/NotFound";
import Home from "../Home/HomeContainer";
import Tos from "./tos";
import Pp from "./pp";
import { ToastContainer } from 'react-toastify';
import PublicCheckin from "../Checkins/PublicCheckin";


const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return { };
};

class App extends Component {
  constructor(props) {
    super(props)
  };

  componentWillMount(){
    console.log("App has mounted");
    this._init();
  };

  _init = () => {
    document.title = `App`;
  };

  render() {
    const {} = this.props;

    return (
      <div>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/tos" component={Tos}/>
          <Route exact path="/pp" component={Pp}/>
          <Route path="/authentication" component={AuthenticationContainer} />
          <Route path="/clubs/:clubId/public-check-in" component={PublicCheckin} />
          <Route path="/clubs" component={ClubContainer} />
          <Route component={NotFound}/>
        </Switch>
        <ToastContainer position="top-right" autoClose={5000} newestOnTop
                        closeOnClick/>
        <div id="push"></div>
      </div>
    );
  };
};

App = withRouter(connect(mapStateToProps, mapDispatchToProps)(App));


export default App;