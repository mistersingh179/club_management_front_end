import axios from 'axios'

export * from './auth.js'
export * from './clubs.js'
export * from './members.js'
export * from './checkins'


axios.defaults.time = 25000;
axios.defaults.baseURL = process.env.REACT_APP_DEVELOPMENT_API_URL;
axios.defaults.withCredentials = false;