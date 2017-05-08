// ==UserScript==
// @name         avmoo_magnet_below
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Practice
// @author       YLaido
// @match        *://avmo.pw/*/movie/*
// @match        *://avmoo.com/*/movie/*
// @match        *://avso.pw/*/movie/*
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.js
// @require      https://cdn.plyr.io/2.0.12/plyr.js
// @resource     PlyrCSS https://cdn.plyr.io/2.0.12/plyr.css
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @connect      btso.pw
// @connect      torrentkitty.ws
// ==/UserScript==

function extract (arr,arr2) {
    for (let i=0;i<arr.length;i++) {
        if (arr2) {
            if (arr[i].innerText == arr2) {
                return arr[i];
            }
        }
        else if (arr[i].innerText=="制作商:"){
            return arr[i];
        }
}
}

function HandleList(list_tk) {           //  处理torrentkitty部分的Style
    var P_tag = list_tk.getElementsByTagName('p');
    var Img_tag = list_tk.getElementsByTagName('img');
    var A_tag = list_tk.getElementsByTagName('a');
    var Re = list_tk.getElementsByClassName('related');
    for (let y=Re.length;y>=0;y--) {
        if (Re[y] !== null && typeof(Re[y]) !="undefined")
            Re[y].remove();}
    for (var b =0;b<Img_tag.length;b++) {
        if (Img_tag[b]!== null && typeof(Img_tag[b] != "undefined")) {
            Img_tag[b].style.width = "4%";
            if (Img_tag[b].src === "http://torrentkitty.ws/static-files/images/ext/video.png") {
                Img_tag[b].nextElementSibling.style.backgroundColor = "#ffb3ff";
            }
        }
        else {console.log(Img_tag[b]);}
    }
    for (var x=0;x<P_tag.length;x++) {
        if (P_tag[x] !== null && typeof(P_tag[x]) != "undefined") {
            if (P_tag[x].className == "dt p0","attr p0","filelist p0") {
                P_tag[x].style.fontSize = '12px';
                if (P_tag[x].className == "dt p1" | P_tag[x].className == "dt p0") {
                    P_tag[x].style.backgroundColor = "#ffdd99";
                }
            }
            else {
                console.log(P_tag[x],"something wrong");
            }
        }
    }
    for (var d=0;d<A_tag.length;d++) {
        if (A_tag[d] !== null && typeof(A_tag[d]) != "undefined") {
            if (A_tag[d].previousElementSibling !== null) {
                if (A_tag[d].previousElementSibling.tagName == "IMG") {      //Magnet
                    A_tag[d].previousElementSibling.style.width = "3%";
                    A_tag[d].onclick = function (event) {
                        GM_setClipboard(this.href);
                        event.preventDefault();
                    };
                    A_tag[d].style.color = "red";
                    A_tag[d].style.fontWeight = "900";
                }
                else if (A_tag[d].previousElementSibling.tagName == "SPAN") {     //File_Name
                    A_tag[d].style.fontWeight = "900";
                    A_tag[d].previousElementSibling.style.fontWeight = "900";
                    A_tag[d].previousElementSibling.style.color = "#8c1aff";
                }
            }
        }
    }
}

//////////////////////////////   One Time Function   !!!!!!!!!!!!!!!!!!!!!!!

(function() {
    document.getElementById('movie-share').remove();
    var plyrCSS = GM_getResourceText ("PlyrCSS");
    $('div[class="row hidden-xs ptb-10 text-center"]').hide();
    GM_addStyle(plyrCSS);                                     //  plyr.js ---- CSS
    GM_addStyle(['.plyr { width: 700px;margin: 0 auto;}',
                 '#Sample {background-color: #c6538c;text-align: center;}',
                 '.plyr__controls {}',
                 'video {object-fit: inherit;}' //poster scale the screen
                    ].join(""));
    var parser = new DOMParser();
    var ParentKey = document.getElementsByClassName('bigImage')[0].href;    // 大图的href
    var Serial = $('span[style="color:#CC0000;"]')[0].innerText;     // 识别码
    var Title = $('p[class="header"]');      // 左侧片商信息区域
    var regTokyo = new RegExp('Tokyo Hot');
    var regCarib = new RegExp('Caribbeancom');
    var regNHDTA = new RegExp('NATURAL HIGH');
    var Preview = document.createElement('video');      //   Sample 视频
    Preview.id = 'player';
    Preview.setAttribute('class','plyr plyr--video plyr--fullscreen-enabled plyr--stopped plyr--ready');
    Preview.setAttribute('controls','controls');
    Preview.poster = ParentKey;
    var ImgDiv = $('div[class="col-md-9 screencap"]')[0];
    var SerialRegCarib = /.*moviepages?\/(.*?)(\/{1})/;     //Caribbean 番号Regex
    var empty = document.createElement('h3');
    var Vendor = extract(Title).nextElementSibling.innerText;      // 制作商Element
    var Publisher = extract(Title,"发行商:").nextElementSibling.innerText;   //发行商Element
    var tk = document.createElement('div');
    var par_recommend = document.getElementsByClassName('row hidden-xs ptb-10 text-center')[0];
    var arr2 = [];
    tk.style.width = "37%";
    tk.style.float = "right";
    empty.innerHTML = '<center>None</center>';
    empty.style.width = '60%';
    var par = $('div.hidden-xs')[2];
    var bro = document.getElementsByClassName('row ptb-20 text-center')[0];
    var num = $('[style="color:#CC0000;"]').text();
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://btso.pw/search/" + num,
        onload: function(response) {
            var r = response.responseText;
            var dom = parser.parseFromString(r, "text/html");
            var data_list = dom.querySelector('body > div.container > div.data-list');      //磁力资源列表
            if (data_list !== null) {
                var size = data_list.getElementsByClassName('col-sm-2 col-lg-1 hidden-xs text-right size'); //size作为粘贴按钮
                var maglink = data_list.getElementsByTagName('a');
                var arr1 = [];
                for (var v=0;v<size.length;v++){
                    arr1.push(maglink[v]);              //若不将maglink存储进array中，后面插入<a>会导致maglink发生变化
                }
                par.insertBefore(data_list,bro);
                data_list.style.float = "left";       //想要div左右分布的话必须一同设置左右float
                var row = $('[class$=row]');
                for (var j=0;j<size.length;j++){
                    var a = document.createElement('a');
                    a.innerText = size[j].innerText;
                    a.setAttribute('class','Copy');
                    a.href = arr1[j].href.replace(/.*hash\//,'magnet:?xt=urn:btih:');
                    a.onclick = function (event) {
                        GM_setClipboard(this.href);
                        event.preventDefault();
                    };
                    size[j].innerText = '';
                    size[j].appendChild(a);
                }
                for (var i=1;i< row.length;i++) {
                    row[i].firstElementChild.setAttribute('target','_blank');
                }
                row.hover(function() {                //鼠标选定时变色
                    $(this).css('background-color','lightblue');
                },function() {
                    $(this).css('background-color','#eeecec');
                });
            }
            else {
                par.insertBefore(empty,bro);
            }
            data_list.style.width = '60%';
            arr2.push(data_list.offsetHeight);
        }
    });    //  AVMOO Finished!!!
    if (regTokyo.test(Vendor)) {                                                                ////////////////// Tokyo-Hot Player Goes Here.//////////////////////
        if (Serial) {
            Preview.onerror = function() {
                let hrefRegex = /.*media\/(.*?)(\/{1})/;
                if (hrefRegex.test(ParentKey)) {
                    let num = hrefRegex.exec(ParentKey)[1];
                    this.src = 'http://my.cdn.tokyo-hot.com/media/samples/' + num + '.mp4';
                }
                else {
                    console.log("Even the href does not match");
                }
            };
            Preview.src = 'http://my.cdn.tokyo-hot.com/media/samples/' + Serial + '.mp4';                  /// Tokyo-Hot
            par_recommend.appendChild(Preview);
           // ImgDiv.removeChild(ImgDiv.getElementsByClassName('bigImage')[0]);
           // ImgDiv.appendChild(Preview);
            plyr.setup();
    }
        else {
            console.log('cannot locate Serial Number');
        }
}
    else {
        console.log('Not Tokyo - Hot');
        console.log(Vendor);
    }
    if (regCarib.test(Vendor)) {
        Preview.src = 'http://smovie.caribbeancom.com/sample/movies/' + Serial + '/1080p.mp4';            /// Caribbean
        par_recommend.appendChild(Preview);
        Preview.onerror = function () {
            this.src = 'http://smovie.caribbeancom.com/sample/movies/' + Serial + '/720p.mp4';
        };
        plyr.setup();
    }
    else {
        console.log('Not Caribbean');
    }
    if (regNHDTA.test(Publisher)) {
        Preview.src = 'http://151.mediaimage.jp/' + Serial.replace(/(-)/,"_") + '.mp4';
        par_recommend.appendChild(Preview);
        plyr.setup();
    }
    if (Preview.src) {
        /*var slideVideo = document.createElement('button');
        slideVideo.innerText = 'Sample';
        slideVideo.setAttribute('id','Sample');
        par_recommend.insertBefore(slideVideo,par_recommend.firstElementChild);*/
        document.querySelector('body > div.container > div.row.movie').nextElementSibling.id = 'Sample';
        $('#Sample').bind('click',function () {
           // $('div[class="plyr plyr--video plyr--fullscreen-enabled plyr--stopped plyr--ready"]').slideToggle('normal');
            $('div[class="row hidden-xs ptb-10 text-center"]').slideToggle('normal');
        });
    }
    GM_xmlhttpRequest({
        method: "GET",                                                    //这里是TorrentKitty第一页部分
        url: "http://torrentkitty.ws/tk/" + num + "/1-0-0.html",
        onload: function(response) {
            var r_tk = response.responseText;
            var dom_tk = parser.parseFromString(r_tk, "text/html");
            var list_tk = dom_tk.querySelector('body > div.container > div.index-middle-center > div.content > div > div.list');
            if (list_tk && list_tk != "undefined") {
                par.insertBefore(tk,bro);
                tk.appendChild(list_tk);             //将TK插入到avmo中
                list_tk.style.overflowY = "scroll";
                list_tk.style.backgroundColor = "#edffb3";
                if (arr2 && arr2[0] >260) {
                    list_tk.style.height = arr2[0].toString() + "px";
                    console.log(arr2[0].toString(),"arr2d");
                }
                else {
                    list_tk.style.height = "260px";
                }
                HandleList(list_tk);
                $(list_tk).on("scroll",function() {
                    var nScrollHight = $(this)[0].scrollHeight;
                    var nScrollTop = $(this)[0].scrollTop;
                    var nDivHight = $(this).height();
                    var Re = $(this).find(".related");
                    for (let y=0;y<Re.length;y++) {
                        Re[y].remove();
                    }
                    if (nScrollTop + nDivHight >= nScrollHight-10) {
                        if (tk.getElementsByClassName('list2')[0]) {
                            console.log('nothing');
                        }
                        else {
                            $(list_tk).off("scroll");
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: "http://torrentkitty.ws/tk/" + num + "/2-0-0.html",
                                onload: function(response) {
                                    var p2 = response.responseText;
                                    var p2_dom = parser.parseFromString(p2,"text/html");
                                    var list_tk2 = p2_dom.querySelector('body > div.container > div.index-middle-center > div.content > div > div.list');
                                    if (list_tk2) {
                                        list_tk2.className = "list2";
                                        list_tk.appendChild(list_tk2);
                                        HandleList(list_tk2);
                                    }
                                }
                            });
                        }
                    }
                });
            }
            else {
                console.log(list_tk);
            }
        }
    });
})();
