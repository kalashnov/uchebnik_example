/*
 * Copyright (c) 2021. Vladimir A. Pshenkin
 * bookmark tool client side scripts
 */

function dc2InitAnchorsData(){

    // init links [link name][link URL]
    $('section.bookPage th').each(function(i, el){
        $(el).html( $(el).html().replace(/\[(.*?)\]\s*\[(.*?)\]/igu, '<a href="$2" target="_blank">$1</a>') );
    });
    $('section.bookPage td').each(function(i, el){
        $(el).html( $(el).html().replace(/\[(.*?)\]\s*\[(.*?)\]/igu, '<a href="$2" target="_blank">$1</a>') );
    });
    $('section.bookPage p').each(function(i, el){
        $(el).html( $(el).html().replace(/\[(.*?)\]\s*\[(.*?)\]/igu, '<a href="$2" target="_blank">$1</a>') );
    });
    $('section.bookPage li').each(function(i, el){
        $(el).html( $(el).html().replace(/\[(.*?)\]\s*\[(.*?)\]/igu, '<a href="$2" target="_blank">$1</a>') );
    });


    // init anchors data
    const bookmarkAttr = 'data-dc2bookmark';
    const sourceAttr = 'data-dc2source';
    $('.text p,.text li').each(function (key, value) {
        // console.log(par++, key, value);
        $(value).attr(bookmarkAttr, key + 1).attr(sourceAttr, $(value).html());
    });
}


$(document).ready(function () {
    const bookmarkAttr = 'data-dc2bookmark';
    const sourceAttr = 'data-dc2source';
    const bookmarkClasses = 'dc2bookmark dc2bookmarkgreen dc2bookmarkviolet dc2bookmarkorange';
    const colorMap = {'dc2bookmarkorange':'orange', 'dc2bookmarkviolet':'violet', 'dc2bookmarkgreen':'green'};
    const colorNameMap = {'orange':'dc2bookmarkorange', 'violet':'dc2bookmarkviolet', 'green':'dc2bookmarkgreen'};
    const apiURL = '/sys/modules/bookmark/bookmark-rpc.php?cmd=';
    const url = window.location.href;

    let userID = 0;

    let linkTOK = $('#linkTOC');
    if( linkTOK.length ){
        let bookName = window.location.pathname.split('/')[1];
        linkTOK.attr('href', '/' + bookName + '/' );

        let bookTitle = $('img.bookTitle');

        if( bookTitle.length ){
            let title = $('section.breadkrumbs>nav>span>a>span').html();
            bookTitle.attr({src: '/i/cover/'+bookName+'.svg', alt: title, title: title});
        }
    }


    function DC2BookmarkGo(id) {
        setTimeout(function() {
            let target = $('[data-dc2bookmark="' + id + '"]');
            if (!target.length) {
                return;
            }
            let area = $('body');
            $('html,body').animate({scrollTop: target.offset().top - area.offset().top + area.scrollTop()});
            /*
            setTimeout(function () {
                target.animate({'background-color': 'rgba(252, 244, 161, 0.4)'}, 'slow');
                setTimeout(function () {
                    target.animate({'background-color': 'unset'}, 'slow')
                }, 1000);
            }, 300);
             */

            // target.css({border: '1px solid lime'});
        }, 500);
    }

    /**
     *
     * @param cmd
     * @param opt
     * @param callback
     */
    function bookmarkAPI(cmd = '', opt = {}, callback = false) {

        let allOpts = Object.assign({}, {'url': url}, opt);
        let opts = '';
        for(let keyName in allOpts){
            if( keyName === 'url'){
                opts += '&' + encodeURIComponent(keyName) + '=' + encodeURIComponent(allOpts[keyName]);
                continue;
            }
            let key = $('#'+keyName);
            if( key.length === 0 ){
                $('#dc2BookmarkDialog').append('<input type="hidden" name="'+keyName+'" id="'+keyName+'" value=""/>');
                key = $('#'+keyName);
            }
            key.val(allOpts[keyName]);
        }

        // console.log('bookmarkAPI URL: ', apiURL + cmd + opts, 'allOpts:', allOpts);
        DC2GetInterfaceJSON(apiURL + cmd + opts, callback, 'dc2BookmarkDialog');
        // TODO: API
    }

    function createAnchor(ev) {

        ev.preventDefault();
        ev.stopPropagation();

        if (userID === 0) {
            w2alert('<span style="font-size:1.3rem">Пожалуйста, войдите в <a href="/login.php">личный кабинет</a> для использования расширенных функций системы.</span>', 'Внимание!');
            return;
        }

        let paragraph = $(this);
        let paragraphNo = paragraph.data('dc2bookmark');

        // console.log('create anchor on:', paragraph, 'paragraph:', paragraphNo);

        if (paragraphNo === undefined || paragraphNo === '') {
            return;
        }

        let currentText = paragraph.attr('data-title');
        if (currentText === undefined) {
            currentText = '';
        }

        let position = $(this).offset();
        position.top += $(this).outerHeight();
        // console.log(position);

        let isNew = paragraph.find('span.dc2bookmark').length === 0;
        // console.log(isNew);

        let bookmarkSpan = $('<span class="dc2bookmark dc2bookmarkorange">');
        let bookmark = paragraph.find('span.dc2bookmark');
        if (!bookmark.length) {
            paragraph.wrapInner(bookmarkSpan);
            bookmark = paragraph.find('span.dc2bookmark');
            bookmark.addClass('dc2bookmark').addClass('dc2bookmarkorange');
        }

        let dialogWidth = isMobile() ? getWindowWidth() * .9 : $('.canva').width() * .5;
        $('<form id="dc2BookmarkDialog" method="post" action="/sys/modules/bookmark-rpc.php">'
            /*+ '<div>'
            + '<span id="orange" class="dc2bookmarkColorSelector dc2bookmarkorange" data-dc2bcc="dc2bookmarkorange"></span>'
            + '<span id="violet" class="dc2bookmarkColorSelector dc2bookmarkviolet" data-dc2bcc="dc2bookmarkviolet"></span>'
            + '<span id="green" class="dc2bookmarkColorSelector dc2bookmarkgreen" data-dc2bcc="dc2bookmarkgreen"></span>'
            + '</div>'*/
            + '<textarea id="note" name="note" style="width: 100%; height: 9rem; border: 1px solid #777777;" placeholder="Напишите ваш комментарий">' + currentText + '</textarea>'
            + '</form>').dialog({
            modal: true,
            // position: {my: "center top", at: "center bottom", of: paragraph},
            closeOnEscape: true,
            // dialogClass: "no-close",
            draggable: true,
            maxWidth: getWindowWidth(),
            // height: getWindowHeight()*.95,
            width: dialogWidth,
            title: 'Комментировать',
            create: function (event/*, ui */) {
                $(event.target).parent().css({ 'position': 'fixed', "left": (getWindowWidth()-dialogWidth)/2, "top": getWindowHeight()/2 });
                // console.log('create', event, ui);
            },
            open: function (/*event, ui*/) {
                // console.log('open', event, ui);
                // bind color change buttons
                $('#bookmarkMarker').html ('<div>'
                    + '<span class="desktoponly">Отметить цветом:</span>'
                    + '<span id="orange" class="dc2bookmarkColorSelector dc2bookmarkorange" data-dc2bcc="dc2bookmarkorange" title="отметить цветом"></span>'
                    + '<span id="violet" class="dc2bookmarkColorSelector dc2bookmarkviolet" data-dc2bcc="dc2bookmarkviolet" title="отметить цветом"></span>'
                    + '<span id="green" class="dc2bookmarkColorSelector dc2bookmarkgreen" data-dc2bcc="dc2bookmarkgreen" title="отметить цветом"></span>'
                    + '</div>');
                $('.dc2bookmarkColorSelector').on('click', function () {
                    let bgc = $(this).data('dc2bcc');
                    // console.log($(this), bgc, bookmark);
                    bookmark.removeClass(bookmarkClasses).addClass('dc2bookmark').addClass(bgc);
                    $('.dc2bookmarkColorSelector').removeClass('active');
                    $(this).addClass('active');
                });
                /*
                if( $('#note').val() === ''){
                    $('#bookmarkSave').prop('disabled', true);
                }
                $('#note').bind('input propertychange', function() {
                    if( $('#note').val() === ''){
                        $('#bookmarkSave').prop('disabled', true);
                    }else{
                        $('#bookmarkSave').prop('disabled', false);
                    }
                });
                 */
            },
            close: function (/*event, ui*/) {
                if( isNew ){
                    paragraph.removeAttr('data-title').removeClass(bookmarkClasses);
                    paragraph.find('span.dc2bookmark').contents().unwrap();
                }
                $(this).dialog('destroy').remove();
            },
            buttons: [
                {
                    id: 'bookmarkDelete',
                    text: 'Удалить',
                    click: function () {
                        // TODO: удалить примечание со страницы и отправить запрос на удаление на сервер
                        paragraph.removeAttr('data-title').removeClass(bookmarkClasses);
                        paragraph.find('span.dc2bookmark').contents().unwrap();

                        bookmarkAPI('removeBookmark', {'paragraph': paragraph.attr(bookmarkAttr)}, function(/*data*/){
                            // console.log(data);
                            $('ul.bookmarks li a[data-ref="'+paragraph.attr(bookmarkAttr)+'"]').parent().remove();

                            $('#dc2BookmarkDialog').dialog('destroy').remove();
                        })
                    },
                    'class': 'dc2input'
                },
                {
                  id: 'bookmarkMarker',
                  text:  '...'
                },
                {
                    id: 'bookmarkSave',
                    text: 'Сохранить',
                    click: function () {
                        // TODO: сохранить примечание на сервере
                        let bookmarkClr = '';
                        for(let className in colorMap){
                            if( bookmark.hasClass(className) ){
                                bookmarkClr = colorMap[className];
                                break;
                            }
                        }

                        let note = $('#note').val().trim();

                        if( note === ''){
                            w2alert('<span style="font-size:1.3rem">Комментарий не может быть пустым.</span>', 'Внимание!', function () {
                                $('#note').focus();
                            });
                            return;
                        }

                        $('#url').val();

                        bookmarkAPI('addBookmark', {/*'note':note,*/ 'paragraph': paragraph.attr(bookmarkAttr), 'mark':bookmarkClr, 'parText': paragraph.attr(sourceAttr)}, function(/*data*/){
                            // console.log(data);
                            paragraph.attr('data-title', note);
                            $('#dc2BookmarkDialog').dialog('destroy').remove();

                            let exists = $('ul.bookmarks li a[data-ref="'+paragraph.attr(bookmarkAttr)+'"]');
                            if( exists.length ){
                                // console.log('Update', exists);
                                exists.parent().removeClass();
                                exists.parent().addClass('dc2bookmarkLB'+bookmarkClr);
                                exists.html(note.replace( /(<([^>]+)>)/ig, ''));
                                return;
                            }

                            if( $('ul.bookmarks').length === 0 ){
                                $('div.bookmarks').append('<ul class="bookmarks"/>');
                            }

                            $('ul.bookmarks').append('<li class="dc2bookmarkLB'+bookmarkClr+'"><a href="#" data-ref="'+paragraph.attr(bookmarkAttr)+'">' + note + '</a></li>');
                            $('a[data-ref="'+paragraph.attr(bookmarkAttr)+'"]').on('click', function (e){
                                e.stopPropagation();
                                // $('.bookmarks').css({left:'-20rem'});
                                DC2BookmarkGo($(this).attr('data-ref'));
                                return false;
                            });

                            $('ul.bookmarks li').sort(function(a, b){
                                return $(a).find('a').attr('data-ref') - $(b).find('a').attr('data-ref');
                            }).appendTo('ul.bookmarks');
                        })
                    },
                    'class': 'dc2input'
                }
            ]
        }).on('keydown', function(evt) {
            // console.log(evt)
            if (evt.keyCode === $.ui.keyCode.ESCAPE) {
                if( isNew ){
                    paragraph.removeAttr('data-title').removeClass(bookmarkClasses);
                    paragraph.find('span.dc2bookmark').contents().unwrap();
                }
                $('#dc2BookmarkDialog').dialog('destroy').remove();
            }
            evt.stopPropagation();
        });
    }

    let h1 = $('h1');

    function initBookmarks(r) {
        // console.log('initBookmarks', r);
        if( r.status === 'success' ){
            if( r.records.length > 0 ) {
                $('div.bookmarks').html('<ul class="bookmarks"/>');
                let bookmarks = $('ul.bookmarks');
                for (let n in r.records) {
                    // special case for page bookmark
                    let rec = r.records[n];
                    
                    if( rec.paragraph === '0' ){
                        // hope only one H1 per page ;)
                        h1.addClass('bookmark');
                        continue;
                    }
                    // console.log(rec);
                    let paragraph = $('p[data-dc2bookmark="' + rec.paragraph + '"]');
                    if (paragraph.length === 0) {
                        paragraph = $('li[data-dc2bookmark="' + rec.paragraph + '"]');
                    }
                    if (paragraph.length === 0) {
                        continue;
                    }
                    paragraph.attr('data-title', rec.note);

                    let bookmarkSpan = $('<span class="dc2bookmark ' + colorNameMap[rec.mark] + '">');
                    if( rec.note !== '' ){
                        bookmarks.append('<li class="dc2bookmarkLB' + rec.mark + '"><a href="#" data-ref="' + rec.paragraph + '">' + rec.note + '</a></li>');
                        $('a[data-ref="' + rec.paragraph + '"]').on('click', function (e) {
                            e.stopPropagation();
                            // $('.bookmarks').css({left:'-20rem'});
                            DC2BookmarkGo($(this).attr('data-ref'));
                            return false;
                        });
                    }
                    paragraph.wrapInner(bookmarkSpan);
                }
            }else if( r.message !== ''){
                $('div.bookmarks').html('<p>' + r.message + '</p>');
            }
        }
    }


    function initUser(r) {
        // console.log('initUser', r);
        if (r.status === 'success' && r.records.userID) {
            userID = r.records.userID;
            bookmarkAPI('getBookmarks', {'url': window.location.href}, initBookmarks);
        } else {
            userID = 0;
        }
    }


    function getBookmarks() {
        // get user bookmarks from server
        bookmarkAPI('isAuthenticated', {'url': window.location.href}, initUser);
    }


    let bookPage = $('.bookPage');

    // init dblclick events on page parts
    if( !bookPage.hasClass('noBookmark') ){
        $('.text p,.text li,.text pre,.text>h2,.text>h3,.text>h4,.text>h5,.text>h6').each(function (key, value) {
            if ($(value).parents('section.CategoryListContainer').length) {
                return;
            }
            $(value).on('dblclick', createAnchor);
        });

        // just only for .bookPage pages
        h1.on('click tap', function (e) {
            e.stopPropagation();

            if (userID === 0) {
                w2alert('<span style="font-size:1.3rem">Пожалуйста, войдите в <a href="/login.php">личный кабинет</a> для использования расширенных функций системы.</span>', 'Внимание!');
                return false;
            }

            if ($(this).hasClass('bookmark')) {
                $(this).removeClass('bookmark');
                bookmarkAPI('removeBookmark', {'paragraph': 0}, function (data) {
                });
            } else {
                $(this).addClass('bookmark');
                $('body').append('<form id="dc2BookmarkDialog" method="post" action="/sys/modules/bookmark-rpc.php">');
                bookmarkAPI('addBookmark', {'paragraph': 0, 'mark': 'red', 'parText': $(this).html()}, function (/*data*/) {
                    $('#dc2BookmarkDialog').remove();
                });
            }
            return false;
        });

    }



    $('#bookSearch').on('click',function(){
        $('#searchResults').html('скоро...');
    });

    getBookmarks();

    let bm = $(location).attr('hash').split('#').pop().replace(/^dc2bm/, '');
    if( bm !== ''){
        DC2BookmarkGo(bm);
    }

    // intelligent anchors processing
    $('.footnoteAnk, .footnotelink, .footnote-back, .footnote-ref').on('click', function(ev){
        ev.stopPropagation();
        DC2scrollTo($(this).attr('href'), -200 );
        return false;
    });


    // prepare books menu for profile page
    if( $(location)[0].pathname.match(/^\/profile\//) ){
        // console.log('prepare books menu workarea');

        let storage = window.localStorage;

        setTimeout(function(){
            // find books in menu

            $('a.bookSelector').on('click tap', function(e){
                e.stopPropagation();

                $('a.bookSelector').removeClass('active');

                $('nav.booksMenu div.links').slideUp('slow');
                $(this).addClass('active').parent().find('div.links').slideDown('slow');

                $('.bookPage>h1').html($(this).html());
                $('#bookmarksUserData').html('');

                storage.setItem('dc2ActiveBookRef', $(this).data('id'));
                // console.log('store Book', $(this).data('id'));

                return false;
            });

            let bookAside = $('.bookAside');
            let asideControl = $('.asideControl');
            let asideMenuOn = false;

            if( isMobile() ) {
                $('body').css({overflow:'hidden'});
                asideControl.on('click tap', function(){
                    if( asideMenuOn ){
                        bookAside.css({left: '-96vw'});
                        asideControl.html('&gt;').removeClass('active');
                        asideMenuOn = false;
                        $('body').css({overflow:'auto'});
                    }else{
                        bookAside.css({left: '0'});
                        asideControl.html('&lt;').addClass('active');
                        asideMenuOn = true;
                        $('body').css({overflow:'hidden'});
                    }
                });
            }

            $('a.infoLink').on('click tap', function (e) {
                e.stopPropagation();

                DC2GetInterfaceJSON(apiURL + 'getUserData'
                    + '&id=' + $(this).data('id')
                    + '&opt=' + $(this).data('ref'), function(r){
                    // TODO: rpc call processing to fill user's book sections data
                    // $('.bookmarksData').html( $(this).attr('data-ref') );
                    $('#bookmarksUserData').html(r.message);
                    // displayCompleteDiagram();
                    MathJax.typeset();
                });

                $('.infoLink').removeClass('active');
                let cshow = $(this).attr('class').replace('infoLink ', '');
                $(this).addClass('active');

                $('.bookPage>h1').html($(this).parent().prev().html()+': ' + $(this).html());

                // let bookURL = $(this).parent().prev().attr('data-ref');

                if( isMobile() ) {
                    // hide toolbar
                    bookAside.css({left: '-96vw'});
                    asideControl.html('&gt;').removeClass('active');
                    asideMenuOn = false;
                    $('body').css({overflow:'auto'});
                }

                $('div.infoBlock').slideUp('slow');
                $('div.'+cshow).slideToggle('slow');

                DC2scrollTo('h1', -200);

                storage.setItem('dc2ActiveBookPartRef', $(this).data('ref'));
                // console.log('store Part', $(this).data('ref'));

                return false;
            });


            // reopen latest book and bookpart
            let storedBook = storage.getItem('dc2ActiveBookRef');
            let activeBook = $('a.bookSelector[data-id="'+storedBook+'"]');

            //console.log('*** Restore book', storedBook, activeBook);

            if( activeBook ){
                activeBook.click();

                let storedPart = storage.getItem('dc2ActiveBookPartRef');
                // console.log('a.infoLink[data-ref="'+storedPart+'"][data-id="'+storedBook+'"]');
                let activePart = $('a.infoLink[data-ref="'+storedPart+'"][data-id="'+storedBook+'"]');

                // console.log('*** Restore book part', storedPart, activePart);
                if( activePart ){
                    activePart.click();
                }

            }

        }, 1000);
    }

    // Complete diagram function
    function displayCompleteDiagram(){
        let diag = $('#compDiag');
        let canvas = document.getElementById("compDiag");

        if (canvas) {
            let ctx=canvas.getContext("2d");

            let w = diag.outerHeight();

            let colors=['#E8541D', '#EBEBEA'];
            let percentage=diag.data('value');
            let values=[percentage, 100-percentage];

            dmbChart(w/2, w/2,.75*w/2,.25*w/2,values,colors, 0);

            function dmbChart(cx, cy, radius, arcwidth, values,colors, selectedValue){

                console.log(cx, cy, radius, arcwidth, values,colors, selectedValue);
                let tot=0;
                let accum=0;
                let PI=Math.PI;
                let PI2=PI*2;
                let offset=-PI/2;
                ctx.lineWidth=arcwidth;
                for(let ii=0;ii<values.length;ii++){tot+=values[ii];}
                for(let i=0;i<values.length;i++){
                    ctx.beginPath();
                    ctx.arc(cx,cy,radius,
                        offset+PI2*(accum/tot),
                        offset+PI2*((accum+values[i])/tot)
                    );
                    ctx.strokeStyle=colors[i];
                    ctx.stroke();
                    accum+=values[i];
                }
                let innerRadius=radius-arcwidth-3;
                /*
                ctx.beginPath();
                ctx.arc(cx,cy,innerRadius,0,PI2);
                ctx.fillStyle=colors[selectedValue];
                ctx.fill();
                 */
                ctx.textAlign='center';
                ctx.textBaseline='center';
                ctx.fillStyle='#303031';
                ctx.font=(innerRadius/1.2)+'px Vollkorn';
                ctx.fillText( Math.ceil(values[selectedValue])+'%', cx,cy+innerRadius*.3);
                ctx.font=(innerRadius/4)+'px verdana';
                // ctx.fillText(labels[selectedValue],cx,cy-innerRadius*.25);
            }
        }
    }

    // toggle display of blocks next to .readMore item class
    setTimeout(function(){
        $('.readMore').on('click', function(ev){
            ev.stopPropagation();
            $(this).next().toggle();
        });
    }, 300);

    // smooth scrolling to hash

    if( window.location.hash !== '' ){
        // console.log('TRAP: ' + window.location.hash);
        setTimeout(function(){
            DC2scrollTo(window.location.hash, -100);
            if( $(window.location.hash).parent().hasClass('readMore') ){
                // console.log('TRAP: readMore...');
                $(window.location.hash).parent().click();
            }
        }, 500);
    }

    setTimeout(function(){
        // transform glossary references

        $('.text p, .text li').each(function() {
            let re = /(\[\[)([^:]*)(:)([^\]]*)(]])/g,
                repl = '<a href="/' + window.location.href.split('/')[3] + '/glossary/#$4" target="_blank" class="bookGlossary" data-ref="$4">$2</a>';
            this.innerHTML = this.innerHTML.replace(re, repl);
        });
        // set handler on localReadMore
        $('a[href^="#"]').each( function() {
            $(this).on('click', function (ev) {
                let href = $(this).attr('href');

                if( href==='#' || $(this).hasClass('footnote-ref') || $(this).hasClass('footnote-back') ){
                    return;
                }

                ev.stopPropagation();

                DC2scrollTo(href, -100);
                if ($(href).parent().hasClass('readMore')) {
                    // console.log('TRAP: readMore...');
                    $(href).parent().click();
                }
                return false;
            });
        });

        // footnotes and back links
        $('a.footnote-ref, a.footnote-back').each( function() {
            $(this).on('click', function (ev) {
                let href = $(this).attr('href');
                ev.stopPropagation();
                if( $(this).hasClass('footnote-back')){
                    let env = $(href).parent().parent();
                    if( env.css('display') === 'none'){
                        env.show();
                    }
                }
                DC2scrollTo(href, -100);
                return false;
            });
        });
    }, 500);

});