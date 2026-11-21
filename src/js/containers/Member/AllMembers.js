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
import RatingsImportSummaryModal from '../../components/Member/RatingsImportSummaryModal'

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

// The file's contents as a Blob plus its name (FileReader works in every browser).
const readIntoMemory = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ blob: new Blob([reader.result], { type: file.type }), name: file.name });
  reader.onerror = () => reject(reader.error);
  reader.readAsArrayBuffer(file);
});

class AllMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRatingsModal: false,
      showModal: false,
      ratingsImportSummary: null,
      ratingsImportError: null,
      ratingsFile: null,
      previewingRatings: false,
      applyingRatings: false
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
            disabled={this.state.previewingRatings}
            style={{ float: 'right', marginRight: 10 }}
          >
            {this.state.previewingRatings ? 'Reading file…' : 'Upload Ratings CSV File'}
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
          <RatingsImportSummaryModal summary={this.state.ratingsImportSummary}
                                     error={this.state.ratingsImportError}
                                     applying={this.state.applyingRatings}
                                     onApply={this._applyRatingsFile}
                                     closeModal={() => this.setState(
                                       { ratingsImportSummary: null, ratingsImportError: null, ratingsFile: null })}/>
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

  // Choosing a file only previews it: the popup lists what would change and
  // nothing is saved until Save changes sends the same file again.
  _uploadRatingsFile = (event) => {
    const file = event.target.files[0];
    // Clear the picker so choosing the same file again (next week's upload)
    // still fires onChange.
    event.target.value = '';
    if (!file) return;
    this.setState({ previewingRatings: true });
    // Keep a copy in memory, so Save sends exactly the file that was previewed
    // even if the CSV on disk is edited in between.
    readIntoMemory(file).then(
      copy => this._sendRatingsFile(copy, true),
      () => this.setState({ previewingRatings: false, ratingsImportError: 'The file could not be read. Please try again.' })
    );
  };

  _applyRatingsFile = () => {
    if (this.state.ratingsFile) {
      this._sendRatingsFile(this.state.ratingsFile, false);
    }
  };

  _sendRatingsFile = (file, preview) => {
    const { uploadRatingsFile, getMembers } = this.props;
    const formData = new FormData();
    formData.append('file', file.blob, file.name);
    this.setState({ applyingRatings: !preview, ratingsImportError: null });

    uploadRatingsFile(formData, preview).then((summary) => {
      if (!preview) {
        // Refresh members after a saved upload
        getMembers();
      }
      // No summary: the session expired (we were sent to sign in), or the
      // backend predates the summary.
      this.setState({
        previewingRatings: false,
        applyingRatings: false,
        ratingsFile: preview ? file : null,
        ratingsImportSummary: summary || null,
        ratingsImportError: null
      });
    }).catch((error) => {
      const reason = error && error.response && error.response.data && error.response.data.error;
      const message = typeof reason === 'string' ? reason : null;
      if (preview) {
        this.setState({
          previewingRatings: false,
          ratingsFile: null,
          ratingsImportSummary: null,
          ratingsImportError: message || 'The upload failed. Please try again.'
        });
      } else {
        // Keep the reviewed list and the file, so Save can simply be retried:
        // it only saves values that still differ, so a save that went through
        // before the error is not repeated.
        this.setState({
          applyingRatings: false,
          ratingsImportError: message
            ? `Saving failed: ${message.replace(/\.$/, '')}. Click Save changes to try again.`
            : 'Saving failed. Click Save changes to try again.'
        });
      }
    });
  };

};

AllMembers = connect(mapStateToProps, mapDispatchToProps)(AllMembers);

export default AllMembers;