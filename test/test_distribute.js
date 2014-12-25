var should = require('should')
  , _ = require('underscore')
  , nock = require('nock')
  , logger = require('../lib/logger')
  , config = require('iol_conf')
  , distribute = require('../lib/distribute');


describe('distribute_mainfunction', function() {
  var http_api;
  var dbUrl = "/db/" + config.dbName + "/series";
  var dataString = "(d 123 456)(d 789 10)";
  var dataObj = [
    {
      name: 'punterX_siteX_sensorschmensor',
      columns: ['time', 'line'],
      points: [[123000, 456], [789000, 10]]
    }
  ];
  beforeEach(function(){
    http_api = nock(config.httpApi)
      .post(dbUrl, dataObj)
      .reply(200);
  });
  it('should convert a data string and post as json to the http api', function(done) {
    var auth = {
      id: 'punterX_siteX',
      username: 'punterX',
      password:'punterX'
    };
    function nockHappy(msg) {
      logger.debug(msg);
      http_api.done();
      done()
    }
    distribute(auth, dataString, logger.error, nockHappy);
  });
  afterEach(function(){
    nock.cleanAll();
  });
});
