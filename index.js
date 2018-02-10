const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const UPDATED = 'UPDATED';
const DEFAULT_FACT_LIST = ['<audio src=\"https://s3.amazonaws.com/dougkiser-polly-mp3s/3c82b919-f7dd-45b6-a7f6-b87c20f97634.mp3" />\''];
const HELP_PHRASE = 'Let Study Guide help you get ready for your exam. You can start by saying, study guide help me study.';
const WELCOME_PHRASE = 'What\'s Up Doug! Let\'s begin studying for that exam bro! Boo Yeah!';

const getRandomFact = (facts = []) => facts[Math.floor(Math.random() * facts.length)];

const getFact = list => {
  const factList = !list
    ? DEFAULT_FACT_LIST
    : list
      .filter(item => item.status === UPDATED)
      .map(item => '<audio src=\"' + item.url + '" />\'');

  return getRandomFact(factList);
};

const handlers = data => ({
  'LaunchRequest': function() {
    this.emit('GetNewFactIntent');
  },
  'GetNewFactIntent': function() {
    const say = `${WELCOME_PHRASE} ${getFact(data && data.Items)}`;
    this.emit(':tell', say);
  },
  'AMAZON.HelpIntent': function() {
    this.emit(':ask', HELP_PHRASE, 'try again');
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', 'Goodbye Doug');
  },
  'AMAZON.StopIntent': function() {
    this.emit(':tell', 'Goodbye Doug');
  }
});

exports.handler = function(event, context, callback) {
  documentClient.scan({
    TableName: process.env.TABLE_NAME
  }, (err, data) => {
    if (!err) {
      const alexa = Alexa.handler(event, context);
      alexa.registerHandlers(handlers(data));
      alexa.execute();
    } else {
      callback(err);
    }
  });
};
