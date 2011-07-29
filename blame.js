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

    blame.cache = {}; 

    blame.diffPlusLine = '<span style="color: #33aa33">{line}</span><br/>';
    blame.diffMinusLine = '<span style="color: #aa5533">{line}</span><br/>';
    blame.diffHeadLine = '<b>{line}</b> <br/>'; 
    blame.diffLine = '{line}<br/>';

	blame.showTemplate = "[ show \u2193 ]";
	blame.hideTemplate = "[ hide \u2191 ]";

    blame.fileTemplate = '<div><a href="{href}" style="color: {color}">{name}</a></div><br/>';

    blame.popupTemplate = 
	'<div class="close" style="position: absolute; right: 16px; top:10px; cursor: pointer;">[ X ]</div>' +
    '<div class="blame-block">' +
        '<h3 style="padding: 10px 35px 10px 20px; margin:0; border-bottom: 1px solid #efefef; cursor: pointer;">Commit: {commit_hash}</h3>' +
        '<div class="blame-info" style="padding: 5px 10px">' +
            '<p style="margin-left: 30px;">Committed: <b>{committed_time}</b> ({committed_date}) <br/>'+
            'Authored: <b>{authored_time}</b> ({authored_date}) <br/>'+ 
            'by <a href="http://github.com/{userlogin}">{username}</a></p>'+                
            '<h4>Message</h4>' +
            '<pre style="max-width: 490px;">{message}</pre>' +
       '</div>' +  
    '</div>' + 
    '<div class="blame-block" style="position: relative;">' + 
        '<h3 style="padding: 10px 20px; margin:0; border-bottom: 1px solid #efefef; cursor: pointer;">Diff</h3>' +
		'<span class="s-h" style="position: absolute; right: 10px; top:10px; cursor: pointer;">' + blame.showTemplate + '</span>'+
        '<div class="blame-info" style="padding: 5px 10px; display:none;">' + 
            '<pre><code>' +
                '{diff}' +
            '</code></pre>' +
       '</div>' +   
    '</div>' +        
    '<div class="blame-block" style="position: relative;">' + 
        '<h3 style="padding: 10px 20px; margin:0; border-bottom: 1px solid #efefef; cursor: pointer;">Files</h3>' +
		'<span class="s-h" style="position: absolute; right: 10px; top:10px; cursor: pointer;">' + blame.showTemplate + '</span>'+
        '<div class="blame-info" style="padding: 5px 10px; display:none;">' + 
            '<h4>Added:</h4>' +
            '<p>{added}</p>' +
            '<h4>Modified</h4>' +
            '<p>{modified}</p>' + 
            '<h4>Deleted</h4>' +
            '<p>{deleted}</p>' +
       '</div>' +   
    '</div>';
   
    blame.popupPosition = {x: '0px', y: '0px'};
    blame.lock = false;

    blame.loadCommit = function (data){

        var popup = ' ', added = 'none', deleted = 'none', modified = 'none', diff = 'none';
        
        if ( data.commit.added != null) {
            added = '';             
            for (var i = 0; i < data.commit.added['length']; i++) {
                console.log( data.commit.added['length']);
                added += blame.fetchTemplate(blame.fileTemplate, {
                    'name' :  data.commit.added[i], 
                    'href' :  data.commit.added[i],  
                    'color': 'green'
                });                        
            }
        }
        
        if ( data.commit.modified != null) {
            modified = '';
            diff = '';
            for (var i = 0; i < data.commit.modified['length']; i++) {
                diff +=  data.commit.modified[i].diff;
                modified += blame.fetchTemplate(blame.fileTemplate, {
                    'name' :  data.commit.modified[i].filename, 
                    'href' :  data.commit.modified[i].filename,    
                    'color' : 'blue',                    
                });                        
            }
        } 

        if ( data.commit.deleted != null) {
            deleted = '';
            for (var i = 0; i < data.commit.deleted['length']; i++) {
                deleted += blame.fetchTemplate(blame.fileTemplate, {
                    'name' :  data.commit.deleted[i],
                    'href' :  data.commit.deleted[i],  
                    'color':'red'
                });                        
            }
        }  

        committed_date = new Date(data.commit.committed_date);        
        authored_date = new Date(data.commit.authored_date); 

        popup = blame.fetchTemplate(blame.popupTemplate, {
            'modified'  : modified,
            'added'     : added,
            'deleted'   : deleted,
            'username'  : data.commit.author.name,
            'email'     : data.commit.author.email,
            'userlogin' : data.commit.author.login,
            'message'   : blame.escape(data.commit.message),
            'commit_hash' : data.commit.id,
            'committed_time' : committed_date.toLocaleTimeString(), 
            'committed_date' : committed_date.toLocaleDateString(),
            'authored_time'  : authored_date.toLocaleTimeString(),
            'authored_date'  : authored_date.toLocaleDateString(),    
            'diff': blame.colorDiff(diff)
        });

        $('#blame-popup').html(popup);

        $('#blame-popup').css({            
            'right': blame.popupPosition.x, 
            'top':  blame.popupPosition.y,
        });        

        $('#blame-popup').fadeIn();
        blame.lock = false;
    };

	blame.showHide = function(){
			var info = $(this).parent().find('.blame-info')
			if(info.is(':visible')){
				info.slideUp(300, function(){
                    $(this).parent().find('.s-h').html(blame.showTemplate); 
                });
			} else {
				info.slideDown(300, function(){
                    $(this).parent().find('.s-h').html(blame.hideTemplate); 
                });								
			}
	}
	
    blame.fetchTemplate = function(template, data){
        var result = template;
        
        for(var i in data) {            
            name = '{' + i + '}';
            result = result.replace(name, data[i]);
        }
        return result;
    };
     
    blame.escape = function (string) {     
        string = string.replace(/&/g, '&amp;');  
        string = string.replace(/</g, '&lt;');  
        string = string.replace(/>/g, '&gt;');  

        return string;
    }
    
    blame.colorDiff = function(diff) {
        function wrapDiff(string) {
            if (string.indexOf('@@ ') == 0) {
                string = blame.fetchTemplate(blame.diffHeadLine,{'line': blame.escape(string)});    
            } else if (string.indexOf('+') == 0) { 
                string = blame.fetchTemplate(blame.diffPlusLine,{'line': blame.escape(string)});    
            } else if (string.indexOf('-') == 0) { 
                string = blame.fetchTemplate(blame.diffMinusLine,{'line': blame.escape(string)});     
            } else {
                string = blame.fetchTemplate(blame.diffLine,{'line': blame.escape(string)});      
            }

            return string;
        }

        lines = diff.split(/\n/);
        _diff = '';
    
        for (var i in lines){
            _diff += wrapDiff(lines[i]);
        }      
        return _diff;
    }
    blame.register = function() {
        $('.blame .commitinfo').click(function(){
//            if (blame.lock) return;             
            blame.lock = true;             

            blame.popupPosition.x = '20px';
            blame.popupPosition.y = $(this).offset().top + 'px';

            current_commit = $(this).find('a:first').html();
            $('.blame .commitinfo').css({'background-color': 'transparent'});
            $('.blame .commitinfo code a').each(function(index, value){            
                if(current_commit == $(value).html()) {
                    $(value).parent().parent().css({'background-color': '#dfa'});
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
		$('#blame-popup .close').live('click', function(){
			$('#blame-popup').fadeOut();
		});
		$('#blame-popup .blame-block h3').live('click', blame.showHide);
		$('#blame-popup .blame-block .s-h').live('click', blame.showHide);
    }

}(window));

$(document).ready(function(){
    blame.register();
});
