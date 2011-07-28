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

    blame.fileTemplate = '<span><a href="{href}">{name}</a></span><br/>';
    blame.popupTemplate = '<h3>Commit</h3>'
        + '<h4>Modified</h4>{modified}'
        + '<h4>Added:</h4>{added}'
        + '<h4>Deleted</h4>{deleted}' 
        + '<div>Committed by <a href="http://github.com/{userlogin}">{username}</a></div>'; 

    blame.popupPosition = {x: '0px', y: '0px'};
    blame.lock = false;

    blame.loadCommit = function (data){

    };

    blame.fetchTemplate = function(template, data){
        var result = template;
        
        for(var i in data) {            
            name = '{' + i + '}';
            result = result.replace(name, data[i]);
        }
        return result;
    };

    blame.register = function() {
        $('.blame .commitinfo').click(function(){
//            if (blame.lock) return;             
            blame.lock = true;             

            blame.popupPosition.x = ($(this).offset().left + 500) + 'px';
            blame.popupPosition.y = $(this).offset().top + 'px';

            current_commit = $(this).find('a:first').html();
            $('.blame .commitinfo').css({'background-color': 'transparent'});
            $('.blame .commitinfo code a').each(function(index, value){            
                if(current_commit == $(value).html()) {
                    $(value).parent().parent().css({'background-color': '#faa'});
                }
            });        

            jsonp("commits/show" + $(this).find('a:first').attr('href').replace(/\/commit\//, '/'), 'blame.loadCommit'); 
        }); 

        $('body').append('<div id="blame-popup"></div>');  
        $('#blame-popup').css({
            'position': 'absolute',
            'width':    '300px',
            'z-index': '100500',
            'display': 'none',       
            'background': '#fff',
            'opacity': 0.9,
            'padding': '20px',
            'padding-top': '10px'
        });         
    }

}(window));

$(document).ready(function(){
    blame.register();
});
