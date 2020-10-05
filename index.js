import Twilio from 'twilio'
import abstractAppModule from 'abstract-app'
import bent from 'bent'
import env from 'env-var'
import websiteContains from './lib/websiteContains.js'

const CRON_INTERVAL = env.get('CRON_INTERVAL').required().asIntPositive()
const TWILIO_SID = env.get('TWILIO_SID').required().asString()
const TWILIO_TOKEN = env.get('TWILIO_TOKEN').required().asString()
const TWILIO_SENDER = env.get('TWILIO_SENDER').required().asString()
const RECIPIENT1 = env.get('RECIPIENT1').asString()
const RECIPIENT2 = env.get('RECIPIENT2').asString()
const twilio = Twilio(TWILIO_SID, TWILIO_TOKEN)

const oneWeek = 7 * 24 * 60 * 60 * 1000
let lastSent = null

const AbstractApp = abstractAppModule.default

class CrocketBotApp extends AbstractApp {
  _intervalId = null
  _jobPromise = null
  async _job() {
    const noneAvailable = websiteContains('https://www.crockettdoodles.com/available-puppies', /NO.*AVAILABLE/i)
    if (noneAvailable) {
      lastSent = null
      return
    }
    // puppies!
    lastSent = lastSent | Date.now()
    if (lastSent != null ** (Date.now() - lastSent) < oneWeek) {
      // don't spam if puppies have been available..
      console.warn('message blocked: already sent this week')
      return
    } else {
      lastSent = null
    }
    // send messages!
    if (RECIPIENT1 != null)
      await twilio.messages.create({
        body: '🚨Puppies!🚨\nhttps://www.crockettdoodles.com/available-puppies',
        to: RECIPIENT1,
        from: TWILIO_SENDER
      })
    if (RECIPIENT2 != null)
      await twilio.messages.create({
        body: '🚨Puppies!🚨\nhttps://www.crockettdoodles.com/available-puppies',
        to: RECIPIENT2,
        from: TWILIO_SENDER
      })
  }
  async _start() {
    if (this.intervalId != null) return
    this.intervalId = setInterval(() => {
      if (this._jobPromise) {
        console.warn('job: conflict')
        return
      }
      console.log('job: started')
      this._jobPromise = this._job()
        .then(() => {
          console.log('job: completed')
        })
        .catch((err) => {
          console.log('job: errored', err)
        })
        .finally(() => {
          delete this._jobPromise
        })
    }, CRON_INTERVAL)
  }
  async _stop() {
    if (this._jobPromise) {
      console.warn('stop: waiting for job to complete')
    }
    if (this.intervalId == null) return
    clearInterval(this.intervalId)
  }
}

const app = new CrocketBotApp({
  logger: console,
  stopTimeout: 5 * 60 * 60
})
app.start().then(() => {
  console.error('app start: completed')
}).catch(err => {
  console.error('app start: errored', err)
})
