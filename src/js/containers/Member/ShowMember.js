import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../../action_creators';
import * as reducers from '../../reducers'
import {withRouter} from 'react-router-dom'
import {Link} from 'react-router-dom'
import { push } from 'react-router-redux'
import {Button, PageHeader, Panel, ListGroup, ListGroupItem} from 'react-bootstrap'
import ConfirmationModal from '../../components/Generic/ConfirmationModal'

const mapStateToProps = (state, ownProps) => {
  const clubId = ownProps.match.params.clubId;
  const memberId = ownProps.match.params.memberId;
  const member = reducers.getMemberFromIdInUrl(state, ownProps);
  return {
    clubId,
    member,
    memberId
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const clubId = ownProps.match.params.clubId;
  return bindActionCreators({
    getMember: actions.getMember.bind(this, clubId),
    removeMember :actions.removeMember.bind(this, clubId),
    goToMembersIndexPage: () => push(`/clubs/${clubId}/members`),
  }, dispatch);
};

class ShowMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    }
  };

  componentWillMount(){
    console.log("ShowMember Container has mounted");
    const memberId = this.props.match.params.memberId;
    this._init(memberId);
  };

  componentWillReceiveProps(nextProps){
    const oldMemberId = this.props.match.params.memberId;
    const newMemberId = nextProps.match.params.memberId;
    console.log("Member has been updated. Old Id: ", oldMemberId, " and New Id: ", newMemberId);
    if(oldMemberId != newMemberId){
      this._init(newMemberId);
    }
  };

  _init = (memberId) => {
    console.log("in init of Show Member: ", memberId);
    this.props.getMember(memberId);
    document.title = `Show Member ${memberId}`;
  };

  render() {
    const {clubId, memberId, member, match, goToMembersIndexPage} = this.props;
    return <div>
      <PageHeader>Showing Member <small> / {memberId}</small>
      </PageHeader>

      <Panel header="Member Details" bsStyle="primary">
        <ListGroup fill>
          <ListGroupItem>Id: {memberId}</ListGroupItem>
          <ListGroupItem>name: {member.name} </ListGroupItem>
          <ListGroupItem>email: {member.email} </ListGroupItem>
          <ListGroupItem>USATT Number: {member.usatt_number} </ListGroupItem>
          <ListGroupItem>USATT Expiration: {member.usatt_expiration} </ListGroupItem>
          <ListGroupItem>League Rating: {member.league_rating} </ListGroupItem>
          <ListGroupItem>Phone Number: {member.phone_number} </ListGroupItem>
          <ListGroupItem>QR Code Number: {member.qr_code_number} </ListGroupItem>
          <ListGroupItem>Table Number: {member.table_number} </ListGroupItem>
          <ListGroupItem>Membership Type: {member.membership_kind} </ListGroupItem>
          <ListGroupItem>Notes: {member.notes} </ListGroupItem>
        </ListGroup>
      </Panel>

      <Button bsStyle="danger"
              onClick={() => this.setState({showModal: true})}>
        Delete this Member!
      </Button>{" "}
      <Link className="btn btn-primary" to={`${match.url}/checkins`}>
        Checkins
      </Link>{" "}
      <Button bsStyle="default"
              onClick={goToMembersIndexPage}>
        Members
      </Button>{" "}
      <ConfirmationModal visible={this.state.showModal}
                         closeModal={() => this.setState({showModal: false})}
                         actionButtonClicked={this._deleteMember}/>
    </div>;
  };

  _deleteMember= (e) => {
    const {memberId, member, removeMember, goToMembersIndexPage} = this.props;
    console.log("delete has been clicked: ", memberId);
    removeMember(memberId).then(
      response => {
        console.log("member has been deleted. now moving to listing page: ", memberId);
        goToMembersIndexPage();
      }
    );
    this.setState({ showModal: false });
  };

};

ShowMember = connect(mapStateToProps, mapDispatchToProps)(ShowMember);

export default ShowMember;