import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Table, Button, Label, MenuItem, DropdownButton, ControlLabel, FormGroup, FormControl } from "react-bootstrap";
import {Link} from 'react-router-dom'
import ConfirmationModal from "../Generic/ConfirmationModal";
import DateFormat from "dateformat";
import NotesSignWithTooltip from "../Generic/NotesSignWithTooltip";
import _ from 'lodash'
import NotificationModal from "../Generic/NotificationModal";
import UpdateCheckinModal from "../Generic/UpdateCheckinModal";
import moment from "moment";

class CheckinTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteConfirmationModal: false,
      showEditCheckinModal: false,
      checkinToBeDeleted: null,
      checkinInFocusForModal: {}
    }
  };

  static defaultProps = {
    checkins: [],
    checkinsSorted: [],
    membersHash: {},
    title: 'hey'
  };

  static propTypes = {
    checkins: PropTypes.array.isRequired,
    checkinsSorted: PropTypes.array.isRequired,
    membersHash: PropTypes.object.isRequired,
    club: PropTypes.object.isRequired,
    removeCheckin: PropTypes.func.isRequired,
    updateCheckin: PropTypes.func.isRequired,
    clubId: PropTypes.number.isRequired,
  };

  render() {
    let {checkins, checkinsSorted, membersHash, checkedInMembers, club} = this.props;
    if(!checkedInMembers){
      checkedInMembers = [];
    }
  
    checkins = checkins.map( checkin => {
      return {
        ...checkin,
        membership_kind: membersHash[checkin.member_id].membership_kind
      }
    });
    
    const partTimeCheckins = checkins.filter(m => m.membership_kind == 'part_time');
    const fullTimeCheckins = checkins.filter(m => m.membership_kind == 'full_time');
    const complimentaryCheckins = checkins.filter(m => m.membership_kind == 'complimentary');
  
    
    const fullTimePaidCheckinsCount = fullTimeCheckins.filter(c => c.paid == true).length;
    const partTimePaidCheckinsCount = partTimeCheckins.filter(c => c.paid == true).length;
    const partTimeUnpaidCheckinsCount = partTimeCheckins.filter(c => c.paid == false).length;
    
    const totalAmountCollected = checkins.reduce((accumulator, currentValue) => accumulator + currentValue.amount_collected, 0);
    
    return (
      <div>
        <h4>
          <Label bsStyle="default">Total: {checkins.length}</Label>{' '}
          <Label bsStyle="danger">Part-Time: {partTimeCheckins.length}</Label>{' '}
          <Label bsStyle="success">Full-Time: {fullTimeCheckins.length}</Label>{' '}
          <Label bsStyle="info">Complimentary: {complimentaryCheckins.length}</Label>{' '}
        </h4>
        <h4>
          <Label bsStyle="success">Full-Time Paid: {fullTimePaidCheckinsCount}</Label>{' '}
          <Label bsStyle="success">Part-Time Paid: {partTimePaidCheckinsCount}</Label>{' '}
          <Label bsStyle="danger">Part-Time Unpaid: {partTimeUnpaidCheckinsCount}</Label>{' '}
        </h4>
        <h4>
          Total Amount Collected: ${totalAmountCollected}.00
        </h4>

        <Table striped bordered hover style={{pageBreakInside: 'auto'}}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={`no-print`}>Email</th>
              <th className={`no-print`}>Rating</th>
              <th className={`no-print`}>USATT Expiration</th>
              <th>Status</th>
              <th>Amount</th>
              <th className={`no-print`}>QR Code</th>
              <th>Checkin</th>
              <th className={`no-print`}></th>
            </tr>
          </thead>
          <tbody>
            {checkinsSorted.map(checkin => {
              return (
                <tr key={checkin.id}>
                  <td className={`contained-column`}>
                    {membersHash[checkin.member_id].name}{' '}
                    <NotesSignWithTooltip notes={membersHash[checkin.member_id].notes} />
                  </td>
                  <td className={`contained-column no-print`}>
                    {membersHash[checkin.member_id].email}
                  </td>
                  <td className={`no-print`}>
                    {membersHash[checkin.member_id].league_rating}
                  </td>
                  <td className={`no-print`}>
                    {moment(membersHash[checkin.member_id].usatt_expiration).format("MM-DD-YYYY")}
                  </td>
                  <td>
                    {this._statusLabel(membersHash[checkin.member_id].membership_kind, checkin)}
                  </td>
                  <td>
                    ${checkin.amount_collected}.00
                  </td>
                  <td className={`no-print`}>
                    {membersHash[checkin.member_id].qr_code_number}
                  </td>
                  <td>{DateFormat(checkin.created_at, "mm-dd-yy h:MM TT")}</td>
                  <td className={`no-print`}>
                    {this.getDropdownButton(checkin, membersHash[checkin.member_id], club)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <ConfirmationModal visible={this.state.showDeleteConfirmationModal}
                             closeModal={() => this.setState({showDeleteConfirmationModal: false})}
                             actionButtonClicked={this._deleteCheckin}/>
          <UpdateCheckinModal
            visible={this.state.showEditCheckinModal}
            closeModal={() => this.setState({showEditCheckinModal: false})}
            updateCheckin={this._updateCheckin}
            checkin={this.state.checkinInFocusForModal}>
          </UpdateCheckinModal>
        </Table>
      </div>
    );
  };
  
  getDropdownButton(checkin, member, club) {
    return <DropdownButton bsStyle={`default`} title={"Options"} id={`dropdown-basic`}>
      { member.membership_kind == "part_time" ? <MenuItem onSelect={this._showEditCheckinModal.bind(this, checkin)}>
          Update Check-in
      </MenuItem> : ""}
      { member.membership_kind == "part_time" ? <MenuItem divider={true}/> : '' }
      { member.membership_kind == "part_time" ? <MenuItem
        onSelect={this._updateCheckin.bind(this, checkin, { paid: true, amount_collected: club.default_amount_to_collect })}>
          Paid ${club.default_amount_to_collect}
        </MenuItem> : ''}
      { member.membership_kind == "part_time" ? <MenuItem
        onSelect={this._updateCheckin.bind(this, checkin, { paid: false, amount_collected: 0 })}>
        Unpaid
      </MenuItem> : ''}
      { member.membership_kind == "part_time" ? <MenuItem divider={true}/> : '' }
      <MenuItem onSelect={this._showDeleteConfirmationModal.bind(this, checkin)}>
        Delete Check-in
      </MenuItem>
      
  
  
  
      
    </DropdownButton>;
  }
  
  _statusLabel = (membership_kind, checkin) => {
    switch(membership_kind){
      case 'part_time':
        return <div>
          <Label className='label-danger'>Part-Time</Label>{"  "}
          <Label bsStyle={checkin.paid == true ? 'success' : 'danger'}>
            {checkin.paid == true ? 'Paid' : 'Unpaid'}
            <i className="icon-ok"></i>
          </Label>
        </div>
      case 'full_time':
        return <Label className='label-success'>Full-Time</Label>;
      case 'complimentary':
        return <Label className='label-info'>Complimentary</Label>;
    }
  }

  _showDeleteConfirmationModal = (checkin) => {
    this.setState({checkinToBeDeleted: checkin});
    this.setState({showDeleteConfirmationModal: true});
  };
  
  _showEditCheckinModal = (checkin) => {
    this.setState({checkinInFocusForModal: checkin});
    this.setState({showEditCheckinModal: true});
  };
  
  _deleteCheckin = () => {
    const {checkinToBeDeleted} = this.state;
    const {clubId, removeCheckin} = this.props;
    console.log("deleting of checkin has been confirmed for checkin:", checkinToBeDeleted);
    removeCheckin(clubId, checkinToBeDeleted.member_id, checkinToBeDeleted.id);
    this.setState({ showDeleteConfirmationModal: false });
  }
  
  _updateCheckin = (checkin, params) => {
    const {clubId, updateCheckin} = this.props;
    console.log("updating checkin: ", checkin, params);
    updateCheckin(clubId, checkin.member_id, checkin.id, params);
  }
};

export default CheckinTable