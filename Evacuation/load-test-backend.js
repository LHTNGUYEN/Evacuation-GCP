import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// backend signup && signin

// ### CLOUD DEPLOYMENT ###
//var getUsers =  'https://evac-backend-uvlznjf2tq-lz.a.run.app/users/count' 

// ### LOCAL DEPLOYMENT ###
//var getUsers =  'http://localhost:3000/users/count' 


// ### LOAD BALANCER ###
var getUsers = "https://34.117.55.38/users/count"


export const requests = new Counter('http_reqs');

// Number of concurrent virtual users, reqesting backend.
// increase from 0 to 15, in 10s
// increase from 15 to 35 in 20s
// increase from 35 to 50 in 30s
// persist VUs at 50 in 9m45s
// decrease to 0 in 1min


export const options = {
  stages: [
    { target: 15, duration: '10s' },
    { target: 35, duration: '20s' },
    { target: 50, duration: '30s' },
    { target: 50, duration: '9m45s' },
    { target: 0, duration: '1m' }
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};

export default function () {
  // GET USERS
  let signupResult = http.get(getUsers);
  
  const checkSignup = check(signupResult, {
    'status is 200 for sign up': (r) => r.status === 200
  });

}





// cd /Users/locnguyen/go/bin
// ./xk6 build --with github.com/szkiba/xk6-dashboard@latest
// ./k6 run --out dashboard /Users/locnguyen/Documents/Kandidat/3semester/Cloud/Final/Evacuation/load-test-backend.js

//./xk6-browser /Users/locnguyen/Documents/Kandidat/3semester/Cloud/Final/Evacuation/evac-test.js