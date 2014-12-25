/**
 * This module is meant to be used by any server (MQTT/COAP,..) once it has
 * received data; the data should be passed on using 'distribute', which takes
 * care that it ends up where it should.
 */

var request = require('request-json')
  , logger = require('./logger')
  , _ = require('underscore')
  , config = require('iol_conf')
  , utils = require('data-utils');

// Takes an `auth` object and a string (the msg/data)
//   auth: {id: <punter_site>, username: <..>, password: <..>}
//
module.exports = function distribute(auth, dataString, error, success) {
  var pS = auth.id.split('_'); // a pair (puntername, sitename)
  var client = request.newClient(config.httpApi);
  client.setBasicAuth(auth.username, auth.password);
  var dbUrl = "/db/" + config.dbName + "/series";
  var dataDefs = config.punters[pS[0]].sites[pS[1]].series;
  var parser = config.dataParsers[config.dataParsers.inUse];
  var parsedData = utils.parseData(dataString, parser, dataDefs);
  logger.debug("(distribute:) Parsed data --> %s", parsedData);
  var namespacedData = utils.namespace(['name'], auth.id, parsedData);
  logger.info("(distribute:) Will post data to: %s, data-chunk: %s",
      dbUrl, namespacedData);
  client.post(dbUrl, namespacedData, function (err, res, body) {
    if (err) {
      return error(err.message);
    } else {
      return success(res.statusCode);
    }
  });
};

