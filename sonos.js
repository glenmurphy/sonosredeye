var http = require('http');

var SONOS_HOST = "10.0.1.16";
var SONOS_DSP_PATH = "/status/proc/driver/audio/dsp";
var SONOS_POLL_INTERVAL = 2000;
var REDEYE_HOST = "10.0.1.19";
var REDEYE_PORT = 82;
var REDEYE_COMMAND_DELAY = 6000;
var REDEYE_PATH_TURNON = "/cgi-bin/play_iph.sh?/devicedata/1377-99999-01.isi%201";
var REDEYE_PATH_INPUT = "/cgi-bin/play_iph.sh?/devicedata/CaptubELVo4%201";

/* MISC -------------------------------------------------------------------- */
Function.prototype.bind = function(thisObj, var_args) {
  var self = this;
  var staticArgs = Array.prototype.splice.call(arguments, 1, arguments.length);

  return function() {
    var args = staticArgs.concat();
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return self.apply(thisObj, args);
  };
};

function fetchPage(host, port, path, resultHandler) {
  var connection = http.createClient(port, host);
  var request = connection.request(path);
  request.addListener('response', function(response) {
    var data = '';
    response.addListener('data', function(chunk) {
      data += chunk;
    });
    response.addListener('end', function() {
      if (resultHandler) resultHandler(data);
    });
  });
  request.end();
};

/* SONOS ------------------------------------------------------------------- */
function Sonos() {
  this.lastReqs = -1;
  this.playing = false;
  setInterval(this.poll.bind(this), SONOS_POLL_INTERVAL);
}

Sonos.prototype.poll = function() {
  fetchPage(SONOS_HOST, 1400, SONOS_DSP_PATH, this.handlePoll.bind(this));
};

Sonos.prototype.handlePoll = function(data) {
  var lines = data.split("\n");
  for (var i = 1; i < lines.length; i++) {
    if (lines[i - 1].substring(0, 5).toLowerCase() == 'reqs(') {
      var reqs = parseInt(lines[i].trim().split(":")[0]);
      this.newReqs(reqs);
      return;
    }
  }
};

Sonos.prototype.playbackBegun = function() {
  this.playing = true;
  console.log("Begun");
  fetchPage(REDEYE_HOST, 82, REDEYE_PATH_TURNON, null);
  setTimeout(function() {
    fetchPage(REDEYE_HOST, 82, REDEYE_PATH_INPUT, null);
  }, REDEYE_COMMAND_DELAY);
};

Sonos.prototype.playbackEnded = function() {
  this.playing = false;
  console.log("Ended");
};

Sonos.prototype.newReqs = function(reqs) {
  if (this.lastReqs == -1) {
    console.log("Init");
  } else if (this.playing == false && reqs != this.lastReqs) {
    this.playbackBegun();
  } else if (this.playing == true && reqs == this.lastReqs) {
    this.playbackEnded();
  }
  this.lastReqs = reqs;
};

var s = new Sonos();