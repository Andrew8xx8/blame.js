/**
 * blame.js is user JavaScript file wich will be include to github page and adds new feachures on blame page.i
 *
 * @author Andrew Kulakov <avk@8xx8.ru>
 * @version 1.0.0
 * @license https://github.com/Andrew8xx8/blame.js/blob/master/MIT-LICENSE.txt
 * @copyright Andrew Kulakov (c) 2011
 */

(function (globals) {

    var apiRoot = "https://github.com/api/v2/json/",

    jsonp = function (url, callback, context) {
        script = document.createElement("script");

        var prefix = "?";
        if (url.indexOf("?") >= 0)
            prefix = "&";

        url += prefix + "callback=" + encodeURIComponent(callback);

        url += "&login=&authToken=";
        
        script.setAttribute("src", apiRoot + url);

        document.getElementsByTagName('head')[0].appendChild(script);
    }, 

    blame = globals.blame = {};

    blame.loadCommit = function (data){

    };

    blame.fetchTemplate = function(template, data){

    };

    blame.register = function() {

    }

}(window));

