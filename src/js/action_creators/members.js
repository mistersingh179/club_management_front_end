import * as WebUtil from '../web_util'
import * as mySchema from '../config/mySchema'
import { normalize } from 'normalizr';
import K from '../constants/'
import {redirectOnUnAuthorized} from "./helper";
import * as reducers from '../reducers';

export const getMembers = (clubId) => dispatch => {
  console.log("inside getMembers");
  return WebUtil.getMembers(clubId).then(
    response => {
      console.log("getMembers response: ", response);
      const normalizedData = normalize(response.data, [mySchema.member]);
      console.log("getMembers normalized data: ", normalizedData);
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const getMembersCheckedInToday = (clubId) => dispatch => {
  console.log("inside getMembersCheckedInToday");
  WebUtil.getMembersCheckedInToday(clubId).then(
    response => {
      console.log("getMembersCheckedInToday response: ", response);
      const normalizedData = normalize(response.data, [mySchema.member]);
      console.log("getMembersCheckedInToday normalized data: ", normalizedData);
      if(normalizedData && normalizedData.entities && !normalizedData.entities.members){
        normalizedData.entities.members = [];
      }
      dispatch({
        type: K.REPLACE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const getMembersCheckedInOndate = (clubId) => (dispatch, getState) => {
  console.log("inside getMembersCheckedInOndate");
  const state = getState();
  const selectedDate = reducers.getCheckinDate(state, null);
  WebUtil.getMembersCheckedInOndate(clubId, selectedDate).then(
    response => {
      console.log("getMembersCheckedInOndate response: ", response);
      const normalizedData = normalize(response.data, [mySchema.member]);
      console.log("getMembersCheckedInOndate normalized data: ", normalizedData);
      if(normalizedData && normalizedData.entities && !normalizedData.entities.members){
        normalizedData.entities.members = {};
      }
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const getMember = (clubId, memberId) => dispatch => {
  console.log("inside getMember: ", clubId, memberId);
  WebUtil.getMember(clubId, memberId).then(
    response => {
      console.log("getMember response: ", response);
      const normalizedData = normalize(response.data, mySchema.member);
      console.log("getMembers normalized data: ", normalizedData);
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const lookupMember = (clubId, lookup_params) => dispatch => {
  console.log("inside lookup: ", clubId, lookup_params);
  return WebUtil.lookupMember(clubId, lookup_params).then(
    response => {
      console.log("lookup response: ", response);
      if(response.data == null){
        response.data = {};
      }
      const normalizedData = normalize(response.data, mySchema.member);
      console.log("getMembers normalized data: ", normalizedData);
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      });
      return normalizedData.result;
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const markAllPartTime = (clubId) => dispatch => {
  console.log("inside markAllPartTime: ", clubId);
  return WebUtil.markAllPartTime(clubId).catch(
    redirectOnUnAuthorized.bind(this, dispatch)
  )
};

export const downloadRatings = (clubId) => dispatch => {
  console.log("inside downloadRatings: ", clubId);
  return WebUtil.downloadRatings(clubId).then(
    response => {
      console.log("downloadRatings response: ", response);
      const normalizedData = normalize(response.data, [mySchema.member]);
      console.log("downloadRatings normalized data: ", normalizedData);
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

// Resolves with the upload summary: which rows matched a member (by USATT
// number, or by name for a member with no USATT number saved), what changes
// for each (old and new value), and which rows didn't match. With preview the
// server saves nothing and sends no members (summary.saved is false). A backend
// without the summary answers with the plain members array; that resolves with
// no summary.
export const parseRatingsCsvFile = (clubId, formData, preview = false) => (dispatch) => {
  return WebUtil.uploadRatingsFile(clubId, formData, preview).then((response) => {
    const withSummary = !Array.isArray(response.data);
    const members = withSummary ? response.data.members : response.data;
    const summary = withSummary ? response.data.summary : undefined;
    if (members) {
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalize(members, [mySchema.member]),
      });
    }
    return summary;
  }).catch(redirectOnUnAuthorized.bind(this, dispatch));
};

export const createMember = (clubId, params) => dispatch => {
  console.log("inside createMember: ", params);
  return WebUtil.createMember(clubId, params).then(
    response => {
      console.log("getMember response: ", response);
      const normalizedData = normalize(response.data, mySchema.member);
      console.log("getMembers normalized data: ", normalizedData);
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const updateMember = (clubId, memberId, params) => dispatch => {
  console.log("inside updateMember: ", clubId, memberId, params);
  return WebUtil.updateMember(clubId, memberId, params).then(
    response => {
      console.log("getMember response: ", response);
      const normalizedData = normalize(response.data, mySchema.member);
      console.log("getMembers normalized data: ", normalizedData);
      dispatch({
        type: K.RECEIVE_ENTITY_ITEM,
        payload: normalizedData
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

export const removeMember = (clubId, memberId) => dispatch => {
  console.log("inside deleteMember: ", memberId);
  return WebUtil.removeMember(clubId, memberId).then(
    response => {
      console.log("deleteMember response: ", response);
      dispatch({
        type: K.REMOVE_ENTITY_ITEM,
        payload: {
          name: "members",
          id: memberId,
        }
      })
    }
  ).catch(redirectOnUnAuthorized.bind(this, dispatch))
};

