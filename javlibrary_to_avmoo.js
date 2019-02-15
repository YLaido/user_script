// ==UserScript==
// @name         javlibrary
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       YLaido
// @match        *://www.javlibrary.com/cn/?v=*
// @grant        GM_xmlhttpRequest
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.js
// @connect      avmoo.net
// @connect      avmoo.xyz
// ==/UserScript==

function setAttributes(el, attrs) {
    for(let key in attrs) {
        if (key === 'innerText') { el.innerText = attrs[key]; }
        else if ( key === 'textContent') { el.textContent = attrs[key]; }
        else if (key === 'innerHTML') { el.innerHTML = attrs[key]; }
        else {el.setAttribute(key, attrs[key]);}
    }
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

(function() {
    var parser = new DOMParser();
    var Serial = $('td.text')[0];
    var avmoJump = document.createElement('a');
    setAttributes(avmoJump,{'textContent':'AVMOO中打开','target':'_blank','style':'padding-left:15px;color:red;font-size:130%'});
    GM_xmlhttpRequest({
        method: "GET",
        url: `https://avmoo.xyz/cn/search/${Serial.textContent}`,
        onload: function(response) {
            let dom = parser.parseFromString(response.responseText, "text/html");
            console.log($(dom).find('div.item'));
            if ($(dom).find('div.item').length === 1) {
                avmoJump.href = $(dom).find('div.item').find('a').attr('href');
            }
            else {
                avmoJump.href = response.finalUrl.toString();
            }
        }
    });
    insertAfter(avmoJump,Serial);
})();
