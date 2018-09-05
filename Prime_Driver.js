// ==UserScript==
// @name         avmoo_magnet_and_trailer
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  Practice
// @author       YLaido
// @match        *://javmoo.com/*/movie/*
// @match        *://javfee.com/*/movie/*
// @match        *://avio.pw/*/movie/*
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.js
// @require      https://cdn.plyr.io/2.0.12/plyr.js
// @resource     PlyrCSS https://cdn.plyr.io/2.0.12/plyr.css
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @connect      btso.pw
// @connect      javlibrary.com
// @connect      cntorrentkitty.org
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

function conbine(kw1,kw2,pf) {
    return ["http://cc3001.dmm.co.jp/litevideo/freepv/" + kw1 + "/" + kw2 + "/" + pf + "/" + pf + "_dmb_w.mp4",
            "http://cc3001.dmm.co.jp/litevideo/freepv/" + kw1 + "/" + kw2 + "/" + pf + "/" + pf + "_dm_w.mp4",
            "http://cc3001.dmm.co.jp/litevideo/freepv/" + kw1 + "/" + kw2 + "/" + pf + "/" + pf + "_sm_w.mp4",
            //  第二种情况
            "http://cc3001.dmm.co.jp/litevideo/freepv/" + kw1 + "/" + kw2 + "/" + pf + "/" + pf + "_dmb_s.mp4",
            "http://cc3001.dmm.co.jp/litevideo/freepv/" + kw1 + "/" + kw2 + "/" + pf + "/" + pf + "_dm_s.mp4",
            "http://cc3001.dmm.co.jp/litevideo/freepv/" + kw1 + "/" + kw2 + "/" + pf + "/" + pf + "_sm_s.mp4"
           ];
}

function test_url(preview,list,callback) {
    if (list.length) {
        preview.src = list[0][0];
    }
    preview.onerror = function() {
        if (list.length) {
            test_url(preview,list,callback);    // Loop through available trailer url.
        }
        else {
            console.log('No more url available!');
            if (callback && typeof(callback) === "function") { callback(); }
            else {console.log('callback is : '+ typeof callback);}
            return;
        }
    };
    if (!list[0].length) {
        list.splice(0,1);
    }
    else {
        list[0].shift();
    }
}


function speed(text,id,cls) {
    let el = document.createElement('button');
    el.innerText = text;
    el.id = id;
    if (cls) {
        el.setAttribute('class',cls);   // Customize speed selecting option of Plyr.
        return el;
    }
    else {
        return el;
    }
}

function verify(iter,serial,title) {
    if (iter instanceof HTMLElement) {                 // For javlibrary.com
        console.log(iter);
        return iter;}
    else {
        for (let i=0;i<iter.length;i++) {
            if (iter[i].innerText == serial && iter[i].parentNode.title == title) {
                return iter[i];
            }
            else {
                var arr1 = title.split(' ');
                var count=0;
                for (let a=0;a<arr1.length;a++) {
                    if (iter[i].parentNode.title.indexOf(arr1[a]) > -1) {
                        count++;
                    }
                }
                if (count >= 2) {return iter[i];}
                else {console.log(count);}
            }
        }
    }
}


function setClick(el,speed,Preview) {
    $(el).click(function () {
        Preview.playbackRate = speed;
        if (speed != 1) {
            $('#Speed')[0].childNodes[0].nodeValue = speed;          // display current playBackRate.
        }
        else {
            $('#Speed')[0].childNodes[0].nodeValue = 'Speed';
        }
    });
}

function lib_sift (iter,pattern) {
    for (let i=0;i<iter.length;i++) {
        if (pattern.test(iter[i])) {            // For javlibrary.com
            return iter[i];
        }
        else {console.log('Library Query ERROR');return false;}
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
            if (Img_tag[b].src === "http://cntorrentkitty.org/static-files/images/ext/video.png") {
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
                        let pattern = /\/([0-9a-zA-Z]{31,41})\.html/;
                        let hash_href = this.parentElement.parentElement.lastElementChild.firstElementChild.href;
                        GM_setClipboard("magnet:?xt=urn:btih:" + pattern.exec(hash_href)[1]);
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
    GM_addStyle(['.plyr__video-wrapper {width: 700px;margin: 0 auto;height: 393px;object-fit: inherit;text-align:center;}',
                 '.plyr__controls {width:700px;margin:auto}',
                 '#Sample {background-color: #c6538c;text-align: center;}',
                 '.speed { width: 65px;left: 0}',
                 '#Speed {text-align: center;width: 65px}',
                 '#speed_2 {bottom: 300%}',
                 '#speed_1_5 {bottom: 200%}',
                 '#speed_1 {bottom: 100%}',
                 'video {object-fit: inherit;}' //make poster scale the screen
                ].join(""));
    var parser = new DOMParser();
    var UA = navigator.userAgent;
    var MainWindow = window;
    var ParentKey = document.getElementsByClassName('bigImage')[0].href;    // avmo每部片大图的href
    var regPF = /video?\/(.*)(\/)/;
    var Serial = $('span[style="color:#CC0000;"]')[0].innerText;     // 识别码(番号)
    var Title = $('p[class="header"]');      // 左侧片商信息区域
    var Title_big = document.getElementsByTagName('h3')[0].innerText;
    var regTokyo = new RegExp('Tokyo Hot');
    var regCarib = new RegExp('Caribbeancom');
    var regSod = new RegExp('SODクリエイト');
    var regNum = /\d{3}/;
    var regNHDTA = new RegExp('ナチュラルハイ');
    var Preview = document.createElement('video');      //   Sample 视频
    Preview.id = 'player';
    Preview.setAttribute('class','plyr--video plyr--fullscreen-enabled plyr--stopped plyr--ready');
    Preview.setAttribute('controls','controls');
    Preview.poster = ParentKey;
    var ImgDiv = $('div[class="col-md-9 screencap"]')[0];
    var SerialRegCarib = /.*moviepages?\/(.*?)(\/{1})/;     //Caribbean 番号Regex
    var empty = document.createElement('h3');
    var Vendor = extract(Title).nextElementSibling.innerText;      // 制作商Element
    var tk = document.createElement('div');
    var Document = window.document;
    tk.id = "TorrentKitty";
    var par_recommend = document.getElementsByClassName('row hidden-xs ptb-10 text-center')[0];
    var arr2 = [];
    $(tk).css({'width':'37%',
              "float" : 'right',
              });
    empty.innerHTML = '<center>Pity, Nothing Found.</center>';
    $(empty).attr({'class': 'data-list',});
    $(empty).css({'width': '60%',
                 'float': 'left',
                 });
    var par = $('div.hidden-xs')[2];
    var bro = document.getElementsByClassName('row ptb-20 text-center')[0];
    var num = $('[style="color:#CC0000;"]').text();
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://btso.pw/search/" + num,
        headers : {"User-Agent": UA},
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
                data_list.style.width = '60%';
                arr2.push(data_list.offsetHeight);
            }
            else {
                par.insertBefore(empty,bro);
            }
        }
    });
    ////////////////////////  Btso Finished!!!  /////////////////////////////

    if (regTokyo.test(Vendor)) {                    ////////////////// Tokyo-Hot Player Goes Here.//////////////////////
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
            plyr.setup({ controls: ['play-large', 'play', 'speed-up', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],displayDuration: true});
        }
        else {
            console.log('cannot locate Serial Number');
        }
    }
    else {
        console.log('Not Tokyo - Hot');
    }
    if (regCarib.test(Vendor)) {
        Preview.src = 'http://smovie.caribbeancom.com/sample/movies/' + Serial + '/1080p.mp4';            /// Caribbean
        par_recommend.appendChild(Preview);
        Preview.onerror = function () {
            this.src = 'http://smovie.caribbeancom.com/sample/movies/' + Serial + '/720p.mp4';
        };
        plyr.setup({ controls: ['play-large', 'play', 'speed-up', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],displayDuration: true});
    }
    else {
        console.log('Not Caribbean');
    }
    if (regNHDTA.test(Vendor)) {
        Preview.src = 'http://151.mediaimage.jp/' + Serial.replace(/(-)/,"_") + '.mp4';                   /// NHDTA
        Preview.onerror = function() {
            this.src = "";
        };
        if (Preview.src) {
            par_recommend.appendChild(Preview);
            plyr.setup({ controls: ['play-large', 'play', 'speed-up', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],displayDuration: true});
        }
    }
    if (regSod.test(Vendor)) {
        let time = $('span.header')[1].parentElement.innerText;
        let Regtime = /(\d{4})-(\d{2})-(\d{2})/;
        let smSerial = Serial.toLowerCase().replace('-','_');
        Preview.src = 'http://dl.sod.co.jp/' + Regtime.exec(time)[1] + Regtime.exec(time)[2] + '/' + smSerial + '/' + smSerial + '_sample.mp4';       /// SOD
        Preview.onerror = function() {
            this.src = "";
        };
        if (Preview.src) {
            par_recommend.appendChild(Preview);
            plyr.setup({ controls: ['play-large', 'play', 'speed-up', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],displayDuration: true});
        }
    }
    if (!Preview.src) {
        if (regPF.test(ParentKey)) {
            var pinfan = regPF.exec(ParentKey)[1];
            let arr1 = pinfan.split("");
            var dfd = $.Deferred();
            var stack01 = [
                conbine( arr1[0],arr1.slice(0,3).join(""),pinfan ),
                conbine( arr1[0],arr1.slice(0,3).join(""),pinfan.replace(/(00)/,"")),
                conbine( arr1[0],arr1.slice(0,3).join(""),pinfan.replace(/(000)/,"") )
            ];
            test_url(Preview,stack01,function() {
                GM_xmlhttpRequest({                                                  // Ultra solution: javlibrary中获取"品番"
                    method: "GET",
                    url: "http://www.javlibrary.com/cn/vl_searchbyid.php?keyword=" + Serial,
                    headers : {"User-Agent": UA},
                    onload: function(response) {
                        var r = response.responseText;
                        var lib_pf;
                        let pattern = /adult\/(.*?)\//;
                        var dom = parser.parseFromString(r, "text/html");
                        var lib_subs = dom.getElementsByClassName('id');    // lib多个候选项时的番号element
                        if (dom.getElementById('video_jacket_img')) {
                            let SRC = dom.getElementById('video_jacket_img').src;
                            lib_pf = pattern.exec(SRC)[1];   // true 品番
                            let arr1 = lib_pf.split("");
                            var stack02 = [
                                conbine(arr1[0],arr1.slice(0,3).join(""),lib_pf)
                            ];
                            test_url(Preview,stack02);
                            console.log('GM did tried01.');
                        }
                        else if (lib_subs) {
                            var lib_subs2 = (function(e) {for (let i=0;i<e.length;i++) {if (e[i].innerText == Serial) {return e[i];}}})(lib_subs);
                            let lib_sub = verify(lib_subs2,Serial,Title_big);
                            let pat = new RegExp(Serial);
                            lib_pf = pattern.exec(lib_sub.nextElementSibling.src)[1]; //here
                            let arr1 = lib_pf.split("");
                            var stack03 = [
                                conbine(arr1[0],arr1.slice(0,3).join(""),lib_pf)
                            ];
                            test_url(Preview,stack03);
                            console.log('GM did tried02.');
                        }
                    }
                });});
            par_recommend.appendChild(Preview);
            plyr.setup({ controls: ['play-large', 'play', 'speed-up', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],displayDuration: true});
        }
    }
    if (Preview.src) {
        var Speed = document.createElement('button');
        var speed_2 = speed('2','speed_2','speed');
        var speed_1_5 = speed('1.5','speed_1_5','speed');
        var speed_1 = speed('1','speed_1','speed');
        Speed.id = 'Speed';
        Speed.innerText = 'Speed';
        document.getElementsByClassName('plyr__controls')[0].insertBefore(Speed,$('button[data-plyr="fullscreen"]')[0]);           //////////// Handling Speed
        document.querySelector('body > div.container > div.row.movie').nextElementSibling.id = 'Sample';
        Speed.appendChild(speed_2);
        Speed.appendChild(speed_1_5);
        Speed.appendChild(speed_1);
        setClick('#speed_2',2,Preview);
        setClick('#speed_1_5',1.5,Preview);
        setClick('#speed_1',1,Preview);
        $('.speed').css({'position':'absolute',
                         'background-color': 'rgba(52,152,219,0.4)',
                         'display': 'none'});
        $('#Sample').bind('click',function () {
            $('div[class="row hidden-xs ptb-10 text-center"]').slideToggle('normal');
        });
        $('#Speed').hover(function () { $('.speed').show();},
                          function() { $('.speed').hide(); });
        $('.speed').hover(function() { $(this).css({'background-color': 'rgba(52,152,219,1.0)'});},
                          function () { $(this).css({'background-color': 'rgba(52,152,219,0.4)'});}
                         );
    }
    ///////////////////////////  Preview Player End Here /////////////////////////////
    var TkFetch = function() {GM_xmlhttpRequest({
        method: "GET",                                                    //这里是TorrentKitty第一页部分
        headers : {"User-Agent": navigator.userAgent},
        url: "http://cntorrentkitty.org/tk/" + num + "/1-0-0.html",
        onload: function(response) {
            var r_tk = response.responseText;
            var dom_tk = parser.parseFromString(r_tk, "text/html");
///////////////////////////////  Bypass CloudFlare  ////////////////////////////////
            if (dom_tk.title.indexOf('moment') > -1) {
                let auth = MainWindow.open("http://cntorrentkitty.org/",'Check_CF','height=100,width=100,top=200,left=1200' );
                let s = setTimeout(function() {
                    auth.close();
                    return TkFetch();
                },5000);
            }
 ///////////////////////////////    Bypass CloudFlare End ///////////////////////
            var list_tk = dom_tk.getElementsByClassName('list')[0];
            if (list_tk && list_tk != "undefined") {
                waitForKeyElements(Document.getElementsByClassName('data-list'),function() {      //waitForKeyElements
                    par.insertBefore(tk,bro);
                    tk.appendChild(list_tk);
                });            /// 将TK插入到avmo中
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
                    if (nScrollTop + nDivHight >= nScrollHight-10) {   //滚动到底加载torrentkitty第二页
                        if (tk.getElementsByClassName('list2')[0]) {
                            console.log('nothing');
                        }
                        else {
                            $(list_tk).off("scroll");
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: "http://cntorrentkitty.org/tk/" + num + "/2-0-0.html",  //加载torrentkitty第二页
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
                console.log("(Check if CloudFlare has interfered.)torrentkitty: ",dom_tk);
            }
        }
    });};
    TkFetch();
})();

function waitForKeyElements (
selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
 actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
 bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
 iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
            .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = '123';
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey];
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                waitForKeyElements (    selectorTxt,
                                    actionFunction,
                                    bWaitOnce,
                                    iframeSelector
                                   );
            },
                                       300
                                      );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}
