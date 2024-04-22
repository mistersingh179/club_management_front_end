import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Link, Switch } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'
import 'react-toastify/dist/ReactToastify.css';



import * as actions from '../../action_creators';
import * as reducers from '../../reducers';

import NotFound from "../../components/Generic/NotFound";
import AllCheckins from "./AllCheckins";
import CheckinsDashboard from "../Checkins/CheckinsDashboard";

import AllMembers from "../Member/AllMembers";
import NewMember from "../Member/NewMember";
import PublicCheckin from "./PublicCheckin";
// import ShowCheckin from "./ShowCheckin";
// import NewCheckin from "../Checkin/NewCheckin";
// import EditCheckin from "../Checkin/EditCheckin";

const mapStateToProps = (state, ownProps) => {
  const {match} = ownProps;
  return {
    match
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    goToPage: url => push(url)
  }, dispatch);
};

class CheckinContainer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {match} = this.props;
    return (
      <div className="container">
        <Switch>
          <Route exact path={match.path} component={AllCheckins}/>
          <Route exact path={`${match.path}/dashboard`} component={CheckinsDashboard}/>
          <Route exact path={`${match.path}/public-checkin`} component={PublicCheckin}/>
          {/*<Route exact path={`${match.path}/new`} component={NewCheckin}/>*/}
          {/*<Route exact path={`${match.path}/:memberId/edit`} component={EditCheckin}/>*/}
          {/*<Route path={`${match.path}/:memberId`} component={ShowCheckin}/>*/}
          <Route component={NotFound}/>
        </Switch>
      </div>
    );
  }
}

CheckinContainer = connect(mapStateToProps, mapDispatchToProps)(CheckinContainer);

export default CheckinContainer