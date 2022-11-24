import { check, sleep } from 'k6';
import { chromium } from 'k6/x/browser';

export const options = {
    scenarios: {
        evacuation: {
            exec: 'evacuation',
            executor: 'per-vu-iterations',
            vus: 1, // 25
            iterations: 1,
            maxDuration: '2m',
            startTime: '0s',
            gracefulStop: '15s'

        },
        survey1: {
            executor: 'per-vu-iterations',
            exec: 'survey',
            vus: 1, // 25
            iterations: 1,
            maxDuration: '2m5s',
            startTime: '2m10s',
        },
        survey2: {
            executor: 'per-vu-iterations',
            exec: 'survey',
            vus: 1, // 25
            iterations: 1,
            maxDuration: '2m10s',
            startTime: '4m20s',
        },
        survey3: {
            executor: 'per-vu-iterations',
            exec: 'survey',
            vus: 1, // 25
            iterations: 1,
            maxDuration: '2m15s',
            startTime: '6m30s',
        },
        survey4: {
            executor: 'per-vu-iterations',
            exec: 'survey',
            vus: 1, // 25
            iterations: 1,
            maxDuration: '2m20s',
            startTime: '8m40s',
            gracefulStop: '10s'
        },
        surveyFinal: {
            executor: 'per-vu-iterations',
            exec: 'surveyFinal',
            vus: 1, // 25
            iterations: 1,
            maxDuration: '5s',
            startTime: '10m50s',
            gracefulStop: '10s'
        },
    },
    thresholds: {
        browser_dom_content_loaded: ['p(90) < 1000'],
        browser_first_contentful_paint: ['max < 1000'],
        checks: ["rate==1.0"],
        http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms

    }
}

export function evacuation() {
    const browser = chromium.launch({
        args: ['show-property-changed-rects'],
        //debug: true,
        //devtools: true,
        headless: false, // true
        timeout: '990s',
    });

    // grant camera and geolocation permissions to context
    const context = browser.newContext({
        permissions: ["geolocation", "camera"],
    });
    context.setGeolocation({ latitude: 59.95, longitude: 30.31667 });
    const page = context.newPage();

    page
        // ### CLOUD DEPLOYMENT ###
        .goto('https://evac-frontend-uvlznjf2tq-lz.a.run.app', { waitUntil: 'networkidle' })

        // ### LOCAL DEPLOYMENT ###
        //.goto('http://localhost:3001/', { waitUntil: 'networkidle' })
        .then(() => {
            page.locator('#root > div > a').click();

            return Promise.all([
            ], page.waitForNavigation()).then(() => {
                page.locator('#root > div > button').click();
                sleep(5000);
                page.waitForLoadState('networkidle');
            })
        })
}

export function survey() {
    const newBrowser = chromium.launch({
        headless: false, // true
        timeout: '990s',
        args: ['show-property-changed-rects']
    });
    const context = newBrowser.newContext({
        permissions: ["geolocation", "camera"],
    });
    const surveyPage = context.newPage();
    // ### CLOUD DEPLOYMENT ###
    surveyPage.goto('https://evac-frontend-uvlznjf2tq-lz.a.run.app/experiment-survey/', { waitUntil: 'networkidle' })

        // ### LOCAL DEPLOYMENT ###
        //surveyPage.goto('http://localhost:3001/experiment-survey/', { waitUntil: 'networkidle' })
        .then(() => {
            surveyPage.locator('#root > form > div:nth-child(1) > div > span:nth-child(1) > input').click(),
                //sleep(1)
                surveyPage.locator('#root > form > div:nth-child(2) > div > span:nth-child(1) > input').click(),
                //sleep(1)
                surveyPage.locator('#root > form > div:nth-child(3) > div > span:nth-child(1) > input').click(),
                //sleep(1)
                surveyPage.locator('#root > form > div:nth-child(4) > div > span:nth-child(1) > input').click(),
                sleep(1)
            surveyPage.locator('#root > form > button').click()
        }).then(() => {
            return Promise.all([
            ], surveyPage.waitForNavigation()).then(() => {
                sleep(14000)
                surveyPage.waitForLoadState('networkidle');
                surveyPage.close();
                newBrowser.close();
            })
        })
}
export function surveyFinal() {
    const newBrowser = chromium.launch({
        headless: false, // true
        timeout: '990s',
        args: ['show-property-changed-rects']

    });
    const context = newBrowser.newContext({
        permissions: ["geolocation", "camera"],
    });
    const surveyPage = context.newPage();

    // ### CLOUD DEPLOYMENT ###
    surveyPage.goto('https://evac-frontend-uvlznjf2tq-lz.a.run.app/survey', { waitUntil: 'networkidle' })

        // ### LOCAL DEPLOYMENT ###
        //surveyPage.goto('http://localhost:3001/survey', { waitUntil: 'networkidle' })
        .then(() => {
            surveyPage.locator('#root > form > input[type=text]:nth-child(4)').type('The Icons');
            surveyPage.locator('#root > form > input[type=text]:nth-child(8)').type('Nothing');
            surveyPage.locator('#root > form > input[type=text]:nth-child(12)').type('212321');
            surveyPage.locator('#root > form > input[type=text]:nth-child(16)').type('Nope');
            surveyPage.locator('#root > form > button').click();
            sleep(5000)
        }, surveyPage.waitForNavigation()).finally(() => {
            sleep(5000)
            surveyPage.close()
            newBrowser.close()
        })
}