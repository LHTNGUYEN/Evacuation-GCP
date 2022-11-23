import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// backend
var signup = 'https://evac-backend-uvlznjf2tq-lz.a.run.app/auth/signup'
var signin = 'https://evac-backend-uvlznjf2tq-lz.a.run.app/auth/signin'

// frontend
var main = 'https://evac-frontend-uvlznjf2tq-lz.a.run.app/main' 

// A simple counter for http requests

export const requests = new Counter('http_reqs');

// you can specify stages of your test (ramp up/down patterns) through the options object
// target is the number of VUs you are aiming for

export const options = {
  stages: [
    { target: 1, duration: '1s' }
  ],
  thresholds: {
    http_reqs: ['count < 100'],
  },
};

export default function () {
  // our HTTP request, note that we are saving the response to res, which can be accessed later

  var generatedUser = new Object();
  generatedUser.email = `user${1000 + Math.floor(Math.random() * 9000)}@test.com`; // generate random 1000 - 9999 inclusive
  generatedUser.roles = ["user"];
  generatedUser.password = "test123";

  // SIGN UP TEST
  let signupResult = http.post(signup, JSON.stringify(generatedUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
 //let res = http.get(main)

  //console.log(res.json());
  //console.log(res);

  const checkSignup = check(signupResult, {
    'status is 200 for sign up': (r) => r.status === 200
  });


  sleep(1)
  
  // SIGN IN TEEST
  let signInResult = http.post(signin, JSON.stringify(generatedUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  //console.log(signInResult.json());

  const checkSignin = check(signInResult, {
    'status is 200 for sign in': (r) => r.status === 200
  });

  sleep(1)

  // SIGN IN TEEST
  let startExperimentResult = http.post(main, {
    headers: { 'Content-Type': 'application/json' },
  });

  console.log(startExperimentResult)

  const checkStartExperiment = check(startExperimentResult, {
    'status is 200 for start experiment': (r) => r.status === 200
  });


}

// cd /Users/locnguyen/go/bin
//./k6 run --out dashboard /Users/locnguyen/Documents/Kandidat/3semester/Cloud/Final/Evacuation/load-test.js