import axios from 'axios'
import {club} from "../config/mySchema";

// CRUD

export const createMember = (clubId, params) => {
  return axios.post(`/clubs/${clubId}/members`, params, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
};

export const getMember = (clubId, memberId) => {
  return axios.get(`/clubs/${clubId}/members/${memberId}`, {
    headers: {
      Accept: "application/json"
    }
  });
};

export const lookupMember = (clubId, lookup_params) => {
  return axios.post(`/clubs/${clubId}/members/lookup`, {
    lookup_params,
  }, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
};

export const globalSearch = (email, phone_number) => {
  return axios.post(`/members/global_search`, {
    email,
    phone_number
  }, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
};

export const markAllPartTime = (clubId) => {
  return axios.post(`/clubs/${clubId}/members/mark_all_part_time`, {}, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
};

export const downloadRatings = (clubId) => {
  return axios.post(`/clubs/${clubId}/members/update_ratings`, {}, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
};

export const uploadRatingsFile = (clubId, formData) => {
  return axios.post(`/clubs/${clubId}/members/parse_ratings_csv_file`, formData, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
};



export const getMembers = (clubId) => {
  return axios.get(`/clubs/${clubId}/members`, {
    headers: {
      Accept: "application/json"
    }
  });
};

export const getMembersCheckedInToday = (clubId) => {
   return axios.get(`/clubs/${clubId}/members/checked_in_today`, {
    headers: {
      Accept: "application/json"
    }
  });
};

export const getMembersCheckedInOndate = (clubId, date) => {
  return axios.get(`/clubs/${clubId}/members/checked_in_on_date`, {
    params: {
      date,
    },
    headers: {
      Accept: "application/json"
    }
  });
};

export const updateMember = (clubId, memberId, params) => {
  return axios.put(`/clubs/${clubId}/members/${memberId}`, params, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
};

export const removeMember = (clubId, memberId) => {
  return axios.delete(`/clubs/${clubId}/members/${memberId}`, {
    headers: {
      Accept: "application/json"
    }
  });
};