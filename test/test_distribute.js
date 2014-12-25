var should = require('should')
  , _ = require('underscore')
  , nock = require('nock')
  , logger = require('../lib/logger')
  , config = require('iol_conf')
  , distribute = require('../lib/distribute');


describe('distribute_mainfunction', function() {
  var http_api;
  var dbUrl = "/db/" + config.dbName + "/series";
  var dataString = "(d 123 456)(a 12 34)(d 789 10)";
  var dataObj = [
    {
      name: 'punterX_siteX_sensorschmensor',
      columns: ['time', 'line'],
      points: [[123000, 456], [789000, 10]]
    },
    {
      name: 'punterX_siteX_SensorX',
      columns: ['time', 'line'],
      points: [[12000, 34]]
    }
  ];
  beforeEach(function(){
    http_api = nock(config.httpApi)
      .post(dbUrl, dataObj[0])
      .reply(200)
      .post(dbUrl, dataObj[1])
      .reply(200);
  });
  it('should convert a data string and post as json to the http api', function(done) {
    var auth = {
      id: 'punterX_siteX',
      username: 'punterX',
      password:'punterX'
    };
    var counter = 0;
    function nockHappy(msg) {
      logger.debug(msg);
      counter ++;
      if (counter === 2) {
        http_api.done();
        done();
      }
    }
    distribute(auth, dataString, logger.error, nockHappy);
  });
  afterEach(function(){
    nock.cleanAll();
  });
});
