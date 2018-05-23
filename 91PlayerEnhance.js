// ==UserScript==
// @name         91pornRotate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       YLaido
// @run-at       document-end
// @match        *://91porn.com/v.php*
// @match        *://91porn.com/view_video*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    let url = window.location.href;
    if (url.indexOf('91porn.com/v.php') > -1) {
        $('.imagechannelhd').each(function(index) {
            $(this).find('a')[0].href = 'http://91porn.com/view_video_hd.php?' + $(this).find('a')[0].href.match(/(viewkey=.*)&page/)[1];
            $(this).next()[0].href = 'http://91porn.com/view_video_hd.php?' + $(this).next()[0].href.match(/(viewkey=.*)&page/)[1];
        })
    }
    else if (url.indexOf('91porn.com/view_video_hd.php?viewkey') > -1){
        GM_addStyle([
            '.Rotate {font-size: 1.5em !important}',
        ])
        let v = window.document.getElementById('vid_html5_api');  // Player
        let setRotate = function(obj,ang) {obj.style.transform = 'rotate(' + ang + 'deg)';};
        var getRotationDegrees = function(obj) {
            var matrix = obj.css("-webkit-transform") || obj.css("-moz-transform") || obj.css("transform");
            var angle;
            if(matrix !== 'none') {
                var values = matrix.split('(')[1].split(')')[0].split(',');
                var a = values[0];
                var b = values[1];
                angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
            }
            else { angle = 0; }
            return (angle < 0) ? angle + 360 : angle;
        };
        let full = $(document.getElementsByClassName('vjs-fullscreen-control vjs-control vjs-button'));
        full.before(//'<button id="_reload"class="vjs-fullscreen-control vjs-control vjs-button"><div>Reload</div></button>'+
                    '<button id="rotateMinus"class="vjs-fullscreen-control vjs-control vjs-button Rotate"><div>左</div></button>' +
                    '<button id="rotateAdd"class="vjs-fullscreen-control vjs-control vjs-button Rotate"><div>右</div></button>');
        //$('#_reload').click(function() {v.load();v.play();});
        $('#rotateMinus').click(function() {setRotate(v,String(getRotationDegrees($(v)) + 90));});
        $('#rotateAdd').click(function() {setRotate(v,String(getRotationDegrees($(v)) - 90));});
    }
})();

