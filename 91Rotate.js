// ==UserScript==
// @name         91pornRotate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       YLaido
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.js
// @run-at       document-end
// @match        *://91porn.com/view_video*
// @grant        none
// ==/UserScript==

(function() {
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
    let v = window.document.getElementById('vid_html5_api');
    let full = $(document.getElementsByClassName('vjs-fullscreen-control vjs-control vjs-button'));
    full.before('<button id="rotateMinus"class="vjs-fullscreen-control vjs-control vjs-button"><div>左</div></button>' +
                '<button id="rotateAdd"class="vjs-fullscreen-control vjs-control vjs-button"><div>右</div></button>');
    $('#rotateMinus').click(function() {setRotate(v,String(getRotationDegrees($(v)) + 90));});
    $('#rotateAdd').click(function() {setRotate(v,String(getRotationDegrees($(v)) - 90));});
})();
