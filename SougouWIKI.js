// ==UserScript==
// @name         SougouWIKI
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       YLaido
// @run-at		document-end
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.js
// @match        *://sougouwiki.com/d/*
// ==/UserScript==

(function() {
    document.getElementsByClassName = document.documentElement.getElementsByClassName.bind(document.documentElement); // enable getElementsByClassName
    $(document).ready(function() {
        let title = $(document.getElementById('content_block_1-body').querySelectorAll('[class="outlink"][rel="nofollow"]'));
        $.each(title,function(i,t){
            if (t.href.indexOf('www.dmm.co.jp') > -1) { //标题的A标签有可能会与图片的A标签重复，此处为判断机制
                let num = /[a-zA-Z]{2,5}\-{0,1}\d{2,4}/;
                let avmoo_ref = '<a href=' +"https://javmoo.net/cn/search/" + num.exec(t.href.split('=').pop())[0] +
                    ' style="color:red;padding-left: 1.2em;font-weight: bold;" target="_blank">AVMOO</a>';
                if (t.nextElementSibling && t.nextElementSibling.innerText === '(レーベル一覧)') {
                    let series = t.nextElementSibling;
                    $(series).after(avmoo_ref);  // 有系列一览
                }
                else{
                    $(t).after(avmoo_ref);      // 无系列一览
                }
            }});
    });
})();
