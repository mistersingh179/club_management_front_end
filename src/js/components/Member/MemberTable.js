import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {Table, Bootstrap, Button, Dropdown, DropdownButton,
  MenuItem, Badge, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import PhoneFormatter from 'phone-formatter'
import NotesSignWithTooltip from '../Generic/NotesSignWithTooltip'
import moment from "moment";

class MemberTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedInMember: {
        name: "unknown"
      }
    }
  };

  static defaultProps = {
    members: [],
  };

  static propTypes = {
    members: PropTypes.array.isRequired,
    match: PropTypes.object.isRequired,
    club: PropTypes.object.isRequired,
    createCheckin: PropTypes.func.isRequired,
    updateCheckin: PropTypes.func.isRequired,
    goToPage: PropTypes.func.isRequired,
  };

  render() {
    const {members, match, searchFields, goToPage, club} = this.props;
    const {checkedInMember} = this.state;
    return (
      <div>
        <h4>Total Members - {members.length}</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>USATT #</th>
              <th>USATT exp</th>
              <th>Membership Type</th>
              <th>Phone #</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              return (
                <tr key={member.id}>
                  <td className={`contained-column`}>
                    {member.name}{' '}
                    <NotesSignWithTooltip notes={member.notes} />
                  </td>
                  <td className={`contained-column`}>{member.email}</td>
                  <td>{member.league_rating}</td>
                  <td>{member.usatt_number}</td>
                  <td>{member.usatt_expiration && moment(member.usatt_expiration).format("MM-DD-YYYY")}</td>
                  <td>{member.membership_kind}</td>
                  <td>{member.phone_number ? PhoneFormatter.format(member.phone_number, "(NNN) NNN-NNNN") : ''}</td>
                  <td>
                    {this.getDropdownButton(goToPage, match, member, club)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };
  
  getDropdownButton(goToPage, match, member, club) {
    return <DropdownButton bsStyle={`default`} title={"Options"} id={`dropdown-basic`}>
      <MenuItem onSelect={goToPage.bind(this, `${match.url}/${member.id}/edit`)}>
        Edit Member
      </MenuItem>
      <MenuItem onSelect={goToPage.bind(this, `${match.url}/${member.id}`)}>
        Member Profile
      </MenuItem>
      <MenuItem divider/>
      <MenuItem onSelect={goToPage.bind(this, `${match.url}/${member.id}/checkins`)}>
        All Check-in's
      </MenuItem>
      <MenuItem divider/>
      <MenuItem onSelect={this._createCheckin.bind(this, member)}>
        Create Check-in
      </MenuItem>
      {member.membership_kind == 'part_time' ? <MenuItem onSelect={this._createCheckinAndMarkPaid.bind(this, member)}>
        Create ${club.default_amount_to_collect} Paid Check-in
      </MenuItem> : ''}
    </DropdownButton>;
  }
  
  _createCheckin = (member) => {
    const {createCheckin} = this.props;
    console.log("in _createCheckin with: ", member.id);
    this.setState({
      checkedInMember: member
    })
    createCheckin(member.id).then(
      response => {
        console.log("create checkin success for:" , member);
      },
      error => {
        console.error("got error creating checkin");
        alert(error);
      }
    )
  };
  
  _createCheckinAndMarkPaid = (member) => {
    const {createCheckin, updateCheckin, club} = this.props;
    console.log("in _createCheckin with: ", member.id);
    createCheckin(member.id).then(
      response => {
        console.log("create checkin success for:" , member);
        updateCheckin(member.id, response.data.id, {
          paid: true,
          amount_collected: club.default_amount_to_collect
        })
      },
      error => {
        console.error("got error creating checkin");
        alert(error);
      }
    )
  };

};

export default MemberTable