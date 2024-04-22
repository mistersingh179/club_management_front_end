import React, {Component} from 'react'
import {connect} from 'react-redux'
import {PageHeader, Button, Grid, Row, Col} from 'react-bootstrap'
import * as actions from '../../action_creators';
import * as reducers from '../../reducers';

import CameraScanner from "../../components/Generic/CameraScanner";
import CheckinTable from '../../components/Checkin/CheckinTable'
import { bindActionCreators } from 'redux'
import {push} from "react-router-redux";
import CheckinActivityTable from "../../components/CheckinActivity/CheckinActivityTable";
import ManualCheckinBox from "../../components/Checkin/ManualCheckinBox";
import Capitalize from "capitalize";

const mapStateToProps = (state, ownProps) => {
    const clubId = ownProps.match.params.clubId;
    const club = reducers.getClubFromIdInUrl(state, ownProps);
    const todaysCheckins = reducers.getTodaysCheckinsArrayFromClubInUrl(state, ownProps);
    const todaysCheckinsSorted = reducers.getTodaysCheckinsSortedByMemberShipType(state, ownProps);
    return {
        club,
        clubId,
        todaysCheckins,
        todaysCheckinsSorted,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const clubId = ownProps.match.params.clubId;
    return bindActionCreators({
        getTodaysCheckins: actions.getMembersCheckedInToday.bind(this, clubId),
    }, dispatch);
};

class PublicCheckin extends Component {
    constructor(props) {
        super(props)
    };

    componentWillMount(){
        console.log("AllCheckins Container has mounted");
        this._init();
    };

    _init = () => {
        const {clubId, getTodaysCheckins} = this.props;
        getTodaysCheckins();
        document.title = `Checkins Dashboard for Club ${clubId}`;
    };


    render() {
        const {club, clubId, todaysCheckins, todaysCheckinsSorted, membersHash, getTodaysCheckins,
            removeCheckin, updateCheckin,
            createCheckinFromQrCode, checkinActivity, checkedInMembers} = this.props;

        console.log("***: ", todaysCheckins);
        return (
            <div>
                <PageHeader className={'no-print'}>
                    Public Checkin's
                    <small> / of club - {club.name ? Capitalize(club.name) : ''} </small>
                    <Button bsStyle="primary" style={{float:'right', marginLeft: 10}}
                            onClick={getTodaysCheckins} >
                        Reload Checkin's
                    </Button>
                    <Button bsStyle="success" onClick={window.print}
                            style={{float:'right', marginLeft: 10}}>
                        Print
                    </Button>
                </PageHeader>
                {/*<ManualCheckinBox updateQrCode={createCheckinFromQrCode} />*/}
                <CheckinTable checkins={todaysCheckins} checkinsSorted={todaysCheckinsSorted}
                              membersHash={membersHash}
                              clubId={clubId} checkedInMembers={checkedInMembers}
                              removeCheckin={removeCheckin}
                              club={club}
                              updateCheckin={updateCheckin}/>
            </div>
        );
    }
}

PublicCheckin = connect(mapStateToProps, mapDispatchToProps)(PublicCheckin);

export default PublicCheckin