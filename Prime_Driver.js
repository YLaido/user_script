// ==UserScript==
// @name         avmoo_magnet_and_trailer
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Practice
// @author       YLaido
// @match        *://avmoo.net/*/movie/*
// @match        *://avmoo.xyz/*/movie/*
// @match        *://javzoo.com/*/movie/*
// @match        *://avmoo.asia/*/movie/*
// @match        *://avsox.host/*/movie/*
// @match        *://avmask.com/*/movie/*
// @match        *://javfee.com/*/movie/*
// @match        *://avio.pw/*/movie/*
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.js
// @require      https://cdn.plyr.io/2.0.12/plyr.js
// @resource     PlyrCSS https://cdn.plyr.io/2.0.12/plyr.css
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @connect      btsow.club
// @connect      btspread.com
// @connect      btos.pw
// @connect      btbit.pw
// @connect      javlibrary.com
// @connect      btdb.io
// @connect      btbit.vip
// @connect      btbit.host
// @connect      btbit.icu
// @connect      btbit.red
// @connect      btbit.fun
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

function get_pagin(URL,site) {
    let pagi = [];
    GM_xmlhttpRequest({
        method : "GET",
        url: URL,
        onload: function (response) {
            let parser = new DOMParser();
            let dom = parser.parseFromString(response.responseText, "text/html");
            if (site=='cntk') {
                if (dom.getElementsByClassName('page-split')) {
                    console.log('this is dom:',dom);
                    pagi = /\d/.exec(dom.getElementsByClassName('page-split')[0].firstElementChild.innerText)[0];

                }
                else {console.log('sth wrong.')}
            }
            else if (site=='btbit') {
                if (dom.getElementsByClassName('pager')) {
                    pagi = /\d/.exec(dom.getElementsByClassName('pager')[0].firstElementChild.innerText)[0];
                    console.log('this is pagin2:',pagi);
                }
                else {console.log('Sth wrong.')}
            }
            console.log('this is pagin1:',pagi);
        }
    })
    return pagi;
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
    else if (iter){
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

function FloatSize(size) {     // parse file size into float number
    var matches = size.match( /^(\d+(?:\.\d+)?)\s*([a-z]+)/i );
    var multipliers = {
        b:  1,
        bytes: 1,
        kb: 1000,
        kib: 1024,
        mb: 1000000,
        mib: 1048576,
        gb: 1000000000,
        gib: 1073741824,
        tb: 1000000000000,
        tib: 1099511627776,
        pb: 1000000000000000,
        pib: 1125899906842624
    };
    if (matches) {
        var multiplier = multipliers[matches[2].toLowerCase()];
        return parseFloat( matches[1] ) * multiplier;
    } else {
        return -1;
    };
}

function setClick(el,speed,Preview) {  // set Play Speed
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


//////////////////////////////   One Time Function   !!!!!!!!!!!!!!!!!!!!!!!
window.addEventListener('load', (event) => {
  (function() {
    let DOMAINLISTS = ['avmoo.net','javlog.com','avmoo.com','javfee.com','avio.pw','avmoo.pw','avmo.pw','avsox.net','avmoo.xyz','javzoo.com','avmoo.asia','avmask.com',"avsox.host"];
    if (DOMAINLISTS.indexOf(location.hostname) > -1 && location.pathname.indexOf('movie') > -1) {
        document.getElementById('movie-share').remove();
        [].forEach.call(document.getElementsByTagName('img'),function(img) {
            img.src = img.src.replace('jp.netcdn.space','pics.dmm.co.jp')

        });  // 将所有图片地址host从jp.netcdn.space换回dmm，加快加载速度
        [].forEach.call(document.getElementsByTagName('a'),function(a) {
            a.href = a.href.replace('jp.netcdn.space','pics.dmm.co.jp')
        });  // 将所有a标签地址host从jp.netcdn.space换回dmm
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
                     'video {object-fit: inherit;}', //make poster scale the screen
                     '.data-list { width: 60%; float: left;}', // btso
                     "#btso-result {width: auto}",
                     '#TorrentKitty { width:37%; float:right;}',
                     '.item-title {font-size: 17px;font-weight: bold;}', // btdb section starts
                     '.item-meta-info {font-size: 120%}',
                     '.fa-magnet {color: red;background-color:#bc1a55}',
                     '.item-meta-info-value {color:red}',
                     'a[title="Download using magnet"] {color: red;font-weight: bold;}', // btdb ends
                     '#btbit_result {height :380px;width:60%;margin-bottom: 35px;background-color: #edffb3; font-size: 85%;float: left; overflow-y: scroll}', // btbit starts
                     '.sbar {font-size:115%}',
                     '.slist {font-size:115%}',
                     '.cpill.fileType2 {display:none;}',
                     'div.like {display:none;}',
                     '.fileCount {color:red;font-size:110%}',
                     '.sbar img{display:inline-block;height:14px;width:14px;vertical-align:middle; margin-right:3px;}', //btbit磁力icon
                     '.slist ul li img{display:inline-block;height:16px;width:16px;vertical-align:middle;margin-right:3px;}', // btbit文件icon
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
        empty.innerHTML = '<center>Pity, Nothing Found.</center>';
        $(empty).attr({'class': 'data-list',});
        var par = $('div.hidden-xs')[2];
        var bro = document.getElementsByClassName('row ptb-20 text-center')[0];
        var num = $('[style="color:#CC0000;"]').text();
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://btsow.club/search/" + num,
            headers : {"User-Agent": UA},
            onload: function(response) {
                var r = response.responseText;
                var dom = parser.parseFromString(r, "text/html");
                var data_list = dom.querySelector('body > div.container > div.data-list');      //磁力资源列表
                var movie_entries = [];
                if (data_list !== null) {
                    var maglink = data_list.getElementsByTagName('a');

                    //////////////    sorting  files by size ///////////////////
                    let big2small = [];
                    [].forEach.call(
                        $(data_list).find('[class$=row]'),function(el) {
                            big2small.push( FloatSize(el.getElementsByClassName('col-sm-2 col-lg-1 hidden-xs text-right size')[0].innerText))
                        }
                    )
                    big2small.sort(function(a,b) {return b-a});
                    for (let i=0;i < $(data_list).find('[class$=row]').length;i++) {
                        movie_entries[i] = {
                            "number" : i,
                            'Filename' : $(data_list).find('[class$=row]')[i].firstElementChild.title,
                            "Size" : $(data_list).find('[class$=row]')[i].getElementsByClassName('col-sm-2 col-lg-1 hidden-xs text-right size')[0].innerText,
                            "Date" : $(data_list).find('[class$=row]')[i].getElementsByClassName('col-sm-2 col-lg-2 hidden-xs text-right date')[0].innerText,
                            "FloatSize": FloatSize($(data_list).find('[class$=row]')[i].getElementsByClassName('col-sm-2 col-lg-1 hidden-xs text-right size')[0].innerText)
                        }
                    };
                    var btso_result = document.createElement('div');
                    let Cache = [];
                    btso_result.className ="data-list";
                    par.insertBefore(btso_result,bro);
                    [].forEach.call(big2small,function(filesize) {
                        [].forEach.call(movie_entries,function(entry,i) {
                            if (entry.FloatSize == filesize && typeof $(data_list).find('[class$=row]')[entry.number] !== 'undefined') {
                                Cache.push($(data_list).find('[class$=row]')[entry.number]);
                                delete movie_entries[i];
                            }})
                    })
                    console.log(Cache);
                    [].forEach.call(Cache,function(el) {btso_result.appendChild(el)})
                    btso_result.style.float = "left";   //想要div左右分布的话必须一同设置左右float
                    btso_result.style.width = '60%';
                    par.insertBefore(btso_result,bro);

                    //////////////   sorting  files by size ///////////////////

                    let rows = $('[class$=row]');
                    rows.hover(function() {                //鼠标选定时变色
                        $(this).css('background-color','lightblue');
                    },function() {
                        $(this).css('background-color','#eeecec');
                    });
                    [].forEach.call(rows,function(row) {
                        let a = document.createElement('a');
                        a.href = row.firstElementChild.href.replace(/.*hash\//,'magnet:?xt=urn:btih:');
                        a.setAttribute('class','Copy');
                        a.onclick = function (event) {
                            GM_setClipboard(this.href);
                            this.style.color = '#98a6bc';
                            event.preventDefault();
                        };
                        let size_field = row.getElementsByClassName('col-sm-2 col-lg-1 hidden-xs text-right size')[0];
                        a.innerText = size_field.innerText;
                        size_field.innerText = '';
                        row.firstElementChild.setAttribute('target','_blank');
                        size_field.appendChild(a);
                    });
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
                var stack01 = [
                    conbine( arr1[0],arr1.slice(0,3).join(""),pinfan ),
                    conbine( arr1[0],arr1.slice(0,3).join(""),pinfan.replace(/(00)/,"")),
                    conbine( arr1[0],arr1.slice(0,3).join(""),pinfan.replace(/(000)/,"") )
                ];
                test_url(Preview,stack01,function() {
                    GM_xmlhttpRequest({                                                  // final solution: javlibrary中获取"品番"
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

        /////////////////   BTBIT starts   //////////////
        /*let btbit = document.createElement('div');
        $(btbit).attr({'id':"btbit_result"});
        GM_xmlhttpRequest({
            method: "GET",
            //timeout: 6000,
            url: 'http://cn.btbit.red/list/' + Serial + '/1-1-0.html',
            onload: function(resp) {
                let dom_bit = parser.parseFromString(resp.responseText, "text/html");
                if (dom_bit.getElementsByClassName('pbox sort-box').length) {
                    btbit.appendChild(dom_bit.getElementsByClassName('pbox')[2]);
                    $(btbit).insertAfter($(par));
                    $('.sbar').find('a').each(function(){     // 按“磁力链接”进行复制
                        $(this).click(function(event) {
                            GM_setClipboard(this.href);
                            this.style.color = '#98a6bc';
                            event.preventDefault();
                        })
                    });
                    $('.sbar').each(function(ParIdx,ParElm) {        // remove redundant details and highlight file count
                        Array.from(ParElm.children).slice(-3)[0].className = 'fileCount';
                        [].forEach.call(Array.from(ParElm.children).slice(-2),function(el) {
                            el.style.display = 'none';
                        });
                    });
                }
            }

        })*/
        ////////////////////   BTBIT Ends  /////////////////////


        /////////////////  BTDB Starts  ////////////////////   Comment out as btdb has been down since 2018.12
        let btdb = document.createElement('div');
        $(btdb).attr({'id':'btdb_result',})
        GM_xmlhttpRequest({
            method: "GET",
            headers: {'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"},
            timeout: 5000,
            url: 'https://btdb.io/search/' + Serial + '/',
            onload: function(resp) {
                let dom_db = parser.parseFromString(resp.responseText, "text/html");
                let item_block = dom_db.getElementsByClassName('media');
                let tmp = []
                //console.log(dom_db.getElementsByClassName('media'));
                if (item_block.length) {
                    for (let i = 0;i<item_block.length;i++) {tmp.push(item_block[i])};
                    console.log(tmp);
                    [].forEach.call(tmp,function(el) {
                        el.getElementsByClassName('img-fluid img-thumbnail hidden-xs hidden-sm')[0].remove();
                        el.getElementsByClassName('media-right hidden-xs')[0].style.display = 'none';
                        let magnet = document.createElement('button');
                        magnet.innerText = 'Magnet';
                        $(magnet).click(function (event) {
                            GM_setClipboard($(el).find('a[class="btn btn-square btn-outline btn-success"]')[0].href);
                            this.style.color = '#98a6bc';
                            event.preventDefault();
                        })
                        el.getElementsByClassName('item-meta-info')[0].appendChild(magnet);
                    });
                    [].forEach.call(tmp,function (el) { btdb.appendChild(el) });
                    $(btdb).insertAfter($(par));

                }
            }
        })
        //////////////////  BTDB Ends  //////////////////////
    }
    else {console.log('wrong domain: ' + location.hostname)}
}
)();
});
