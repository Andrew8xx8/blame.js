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
	blame.showTemplate = "[ show \u2193 ]";
	blame.hideTemplate = "[ hide \u2191 ]";
    blame.fileTemplate = '<div><a href="{href}">{name}</a></div><br/>';
    blame.popupTemplate = 
	'<div class="close">[ X ]</div>' +
    '<div class="blame-block">' +
        '<h3 style="padding: 10px 20px; margin:0; border-bottom: 1px solid #efefef">Commit: {commit_hash}</h3>' +
        '<div class="blame-info" style="padding: 5px 10px">' +
            '<p style="margin-left: 30px;">Committed date: {committed_date} <br/>'+
            'Authored date: {authored_date} <br/>'+ 
            'by <a href="http://github.com/{userlogin}">{username}</a></p>'+                
            '<h4>Message</h4>' +
            '<p>{message}</p>' +
       '</div>' +  
    '</div>' + 
    '<div class="blame-block">' + 
        '<h3 style="padding: 10px 20px; margin:0; border-bottom: 1px solid #efefef">Diff</h3>' +
		'<span>' + blame.showTemplate + '</span>'+
        '<div class="blame-info" style="padding: 5px 10px; display:none;">' + 
            '{diff}' +
       '</div>' +   
    '</div>' +     
    '<div class="blame-block">' + 
        '<h3 style="padding: 10px 20px; margin:0; border-bottom: 1px solid #efefef">Files</h3>' +
		'<span>' + blame.showTemplate + '</span>'+
        '<div class="blame-info" style="padding: 5px 10px display:none;">' + 
            '<h4>Modified</h4>' +
            '<p>{modified}</p>' +
            '<h4>Added:</h4>' +
            '<p>{added}</p>' +
            '<h4>Deleted</h4>' +
            '<p>{deleted}</p>' +
       '</div>' +   
    '</div>';
        

    blame.popupPosition = {x: '0px', y: '0px'};
    blame.lock = false;

    blame.loadCommit = function (data){

        var popup = ' ', added = 'none', deleted = 'none', modified = 'none';
        
        if ( data.commit.added != null) {
            added = '';
            for (var i in data.commit.added) {
                added += blame.fetchTemplate(blame.fileTemplate, {'name' :  data.commit.added[i]});                        
            }
        }
        
        if ( data.commit.modified != null) {
            modified = '';
            for (var i in data.commit.modified) {
                modified += blame.fetchTemplate(blame.fileTemplate, {'name' :  data.commit.modified[i].filename});                        
            }
        } 

        if ( data.commit.added != null) {
            for (var i in data.commit.added) {
                added += blame.fetchTemplate(blame.fileTemplate, {'name' :  data.commit.added[i]});                        
            }
        }  

        popup = blame.fetchTemplate(blame.popupTemplate, {
            'modified' : modified,
            'added'    : added,
            'deleted'  : deleted,
            'username' : data.commit.author.name,
            'email'    : data.commit.author.email,
            'userlogin': data.commit.author.login
        });

        $('#blame-popup').html(popup);

        $('#blame-popup').css({            
            'left': blame.popupPosition.x, 
            'top':  blame.popupPosition.y,
        });        

        $('#blame-popup').fadeIn();
        blame.lock = false;
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
            'width':    'auto',
            'z-index': '100500',
            'display': 'none',       
            'background': '#fff',
            'padding': '6px',
            'padding-top': '10px',
            'color' :  '#444',
			'border-radius': '8px',
			'box-shadow': '0px 0px 10px 0px #888'
        });         
    }

}(window));

$(document).ready(function(){
    blame.register();
});
