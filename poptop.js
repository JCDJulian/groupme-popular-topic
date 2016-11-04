// Uses request library: https://github.com/request/request
var request = require('request');
var assert = require('assert');
var env = require('node-env-file');
// Load any undefined ENV variables from a specified file.
env('.env');


var BASE_URL = 'https://api.groupme.com/v3';
var GROUP_ID = process.env.GROUP_ID;
var TOKEN = process.env.API_TOKEN;
var comment_URL = BASE_URL + '/groups/' + GROUP_ID + '/likes?period=month&token='+ TOKEN;
var post_URL = BASE_URL + '/groups/' + GROUP_ID + '/update?token='+ TOKEN;
var title = '';
var topic = '';
var imageURL = ''
var body = '';

var date = new Date();
var current_day = date.getDay();

//Only run on Mondays
if (current_day == 1){

  // GET top posts of the week
  request.get(comment_URL)
  .on('response', function(response) {
    console.log(response.statusCode) // 200
    console.log(response.headers['content-type']) // 'image/png'
    response.on('data', function(chunk) {
    	body += chunk;
    });
    response.on('end', function() {
    	var json = JSON.parse(body);
    	var messages = json.response.messages;

      // Get top non-image and save it to title
    	for (var i = 0; i < messages.length; i++) {
    		if((messages[i].attachments.length == 0) && (messages[i].text.length < 140)) {
    			title = messages[i].text;
    			break;
    		}
    	}

      // Get next top non-image and save it to topic
      for (i++; i < messages.length; i++) {
        if((messages[i].attachments.length == 0) && (messages[i].text.length < 140)) {
          topic = messages[i].text;
          break;
        }
      }

      for (var i=0; i < messages.length; i++) {
        if (messages[i].attachments.length > 0 && messages[i].attachments[0].type === "image") {
          imageURL = messages[i].attachments[0].url
        }
      }

      console.log(title);
      console.log(topic);
      console.log(imageURL);

      var postRequest = {}

      if (imageURL.length > 0) {
        postRequest = 
        {
          "url" : post_URL,
          "json" : {
            "name": title,
            "description": topic,
            "image_url": imageURL
          }
        }
      } else {
        postRequest = 
        {
          "url" : post_URL,
          "json" : {
            "name": title,
            "description": topic
          }
        }
      }

      // POST the new name and description
      request.post(postRequest, function(error, response, body) {
        console.log(body);
      });
    });
  })
}
