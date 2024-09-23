import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Capitalize from 'capitalize'

import * as actions from '../../action_creators';
import * as reducers from '../../reducers'

import MemberTable from '../../components/Member/MemberTable'
import {PageHeader} from 'react-bootstrap'
import { push } from 'react-router-redux'
import {Button} from 'react-bootstrap'
import MemberLookup from "../../components/Member/MemberLookup";
import ConfirmationModal from '../../components/Generic/ConfirmationModal'

const mapStateToProps = (state, ownProps) => {
  const match = ownProps.match;
  const clubId = ownProps.match.params.clubId;
  const club = reducers.getClubFromIdInUrl(state, ownProps);
  let membersArray = reducers.getFilteredMembersArray(state, ownProps);
  membersArray = membersArray.sort((a,b) => {
    let name1 = "";
    let name2 = "";
    if(a && a.name){
      name1 = a.name.toLowerCase();
    }
    if(b && b.name){
      name2 = b.name.toLowerCase();
    }
    console.log(name1, name2, name1.toLowerCase() > name2.toLowerCase());

    if (name1 > name2){
      return 1
    }else if (name1 < name2){
      return -1
    }else{
      return 0
    }
  });
  const searchFields = reducers.getSearchFields(state, ownProps);

  return {
    match,
    members: membersArray,
    club,
    clubId,
    searchFields,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const clubId = ownProps.match.params.clubId;
  const {match} = ownProps;
  return bindActionCreators({
    getMembers: actions.getMembers.bind(this, clubId),
    goToNewMembersPage: () => push(`${match.url}/new`),
    goToAllClubs: () => push(`/clubs`),
    createCheckin: (memberId) => actions.createCheckin(clubId, memberId),
    updateCheckin: actions.updateCheckin.bind(this, clubId),
    updateSearchFields: actions.updateSearchFields,
    markAllPartTime: actions.markAllPartTime.bind(this, clubId),
    downloadRatings: actions.downloadRatings.bind(this, clubId),
    uploadRatingsFile: actions.parseRatingsCsvFile.bind(this, clubId), // New action for file upload
    goToPage: url => push(url)
  }, dispatch);
};

class AllMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRatingsModal: false,
      showModal: false
    }
  };

  componentWillMount(){
    console.log("AllMembers Container has mounted");
    this._init();
  };

  _init = () => {
    this.props.getMembers();
    document.title = `Members`;
  };

  render() {
    const {club, clubId, goToNewMembersPage, goToAllClubs} = this.props;
    return (
      <div>
        <PageHeader>
          Members
          <small> / {club.name ? Capitalize(club.name) : ''} </small>
          <Button bsStyle="primary" onClick={goToNewMembersPage}
                  style={{ float: 'right', marginLeft: 10 }}>
            New Member
          </Button>
          <Button bsStyle="success"
                  onClick={() => this.setState({ showRatingsModal: true })}
                  style={{ float: 'right', marginLeft: 10 }}>
            Download Ratings
          </Button>
          <Button
            bsStyle="primary"
            onClick={() => this.fileInput.click()}
            style={{ float: 'right', marginRight: 10 }}
          >
            Upload Ratings CSV File
          </Button>
          <input
            type="file"
            accept=".csv"
            ref={(input) => (this.fileInput = input)}
            style={{ display: 'none' }}
            onChange={this._uploadRatingsFile}
          />

          <ConfirmationModal visible={this.state.showModal}
                             closeModal={() => this.setState(
                               { showModal: false })}
                             actionButtonClicked={this._markAllPartTime}/>
          <ConfirmationModal visible={this.state.showRatingsModal}
                             closeModal={() => this.setState(
                               { showRatingsModal: false })}
                             actionButtonClicked={this._downloadRatings}/>
        </PageHeader>

        <MemberLookup {...this.props}  />
        <MemberTable {...this.props} />

        <Button bsStyle="danger"
                onClick={() => this.setState({ showModal: true })}
                style={{ marginRight: 10 }}>
        Reset All Members to Part-Time Status
        </Button>
        <Button bsStyle="default" onClick={goToAllClubs}>
          Clubs
        </Button>
      </div>
    );
  };

  _markAllPartTime = () => {
    const {markAllPartTime, getMembers} = this.props;
    markAllPartTime().then(
      response => {
        console.log("all members have been marked as part time");
        return getMembers();
      }
    ).then(
      response => {
        console.log("all memebers have been fetched again");
        this.setState({ showModal: false });
      }
    )
  };

  _downloadRatings = () => {
    const {downloadRatings} = this.props;
    downloadRatings().then(
      response => {
        this.setState({ showRatingsModal: false });
      }
    )
  };

  _uploadRatingsFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const { uploadRatingsFile } = this.props;
      const formData = new FormData();
      formData.append('file', file);

      // Call the new action to upload and parse the file
      uploadRatingsFile(formData).then((response) => {
        // Refresh members after successful upload
        const { getMembers } = this.props;
        getMembers();
      });
    }
  };

};

AllMembers = connect(mapStateToProps, mapDispatchToProps)(AllMembers);

export default AllMembers;