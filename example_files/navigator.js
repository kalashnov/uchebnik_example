$(document).ready(function () {
    let body = $('body');
    let menu = $('#navMain');
    let bookPage = $('.bookPage');
    let margins =  (body.outerWidth() - bookPage.outerWidth())/2;
    let tools = $('.bookTools');
    let mtWidth = isMobile() ? getWindowWidth() : (margins < 300 ? 300 : margins);
    let fontSize = $('a.fontSize');


    // console.log(isMobile(), getWindowWidth());

    let defaultFontSize = localStorage.getItem('defaultFontSize');
    if( !defaultFontSize ){
        defaultFontSize = '100%';
    }
    bookPage.css({'font-size': defaultFontSize});

    fontSize.removeClass('active');
    if (defaultFontSize === '80%'){
        $('a.fontSmall').addClass('active');
    }
    else if (defaultFontSize === '120%') {
        $('a.fontLarge').addClass('active');
    }
    else {
        defaultFontSize = '100%';
        $('a.fontMedium').addClass('active');
    }


    if( !tools.length ){
        $('a.pageSet').css({opacity: .5});
    }else {


        tools.css({width: mtWidth + 'px', 'z-index': 10001, 'position': 'fixed', 'left': '-' + mtWidth + 'px'});


        $(document).on('keyup', function (evt) {
            if (evt.keyCode === 27) {
                if (tools.css('left') === '0px') {
                    tools.css({'left': '-' + mtWidth + 'px'});
                    body.removeClass('hc-nav-open');
                    $('html').removeClass('hc-nav-yscroll');
                    $('#bookToolsGrayer').remove();
                }
            }
        });

        $('a.pageSet').on('click', function (e) {

            e.stopPropagation();

            let bodyTop = $(document).scrollTop();

            if (tools.css('left') !== '0px') {
                tools.css({'left': '0px'});

                body.css({top: (-bodyTop) + 'px'}).addClass('hc-nav-open');
                $('html').addClass('hc-nav-yscroll');
            } else {
                tools.css({'left': '-' + mtWidth + 'px'});
            }

            $('<div id="bookToolsGrayer" style="width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:10000;position: fixed;top: 0;left: 0;" />').insertBefore(menu);
            $('#bookToolsGrayer').on('click', function () {
                tools.css({'left': '-' + mtWidth + 'px'});
                body.removeClass('hc-nav-open');
                body.css({top: ''});
                $(document).scrollTop(bodyTop);
                $('html').removeClass('hc-nav-yscroll');
                $(this).remove();
            });

            return false;
        });

        fontSize.on('click', function () {
            fontSize.removeClass('active');
            let btn = $(this);
            let size = '100%';
            if (btn.hasClass('fontSmall')) {
                $('a.fontSmall').addClass('active');
                size = '80%';
            } else if (btn.hasClass('fontLarge')) {
                $('a.fontLarge').addClass('active');
                size = '120%';
            }else{
                $('a.fontMedium').addClass('active');
                size = '100%';
            }
            bookPage.css({'font-size': size});
            localStorage.setItem('defaultFontSize', size);
            if( isMobile() ){
                // close toolbar
                tools.css({'left': '-' + mtWidth + 'px'});
                body.removeClass('hc-nav-open');
                body.css({top: ''});
                $('html').removeClass('hc-nav-yscroll');
                $('#bookToolsGrayer').remove();
            }
        });

        $('.bookTools .dc2close').on('click', function (e) {
            e.stopPropagation();
            tools.css({'left': '-' + mtWidth + 'px'});
            body.removeClass('hc-nav-open');
            body.css({top: ''});
            $('html').removeClass('hc-nav-yscroll');
            $('#bookToolsGrayer').remove();
            return false;
        });
    }

    let prevPage = $('.pageNav a.prevPage');
    let nextPage = $('.pageNav a.nextPage');

    prevPage.addClass('disabled');
    nextPage.addClass('disabled');

    if (!menu.length) {
        return;
    }

    if( menu.find('ul').length === 0 ){
        return;
    }

    $('.pageNav a').css({'display': 'inline-block'});
    $('.pageNav a img').css({'display': 'inline-block'});


    var $nav = menu.hcOffcanvasNav({
        insertClose: true,
        insertBack: true,
        labelClose: '',
        labelBack: '',
        levelTitleAsBack: true,
        width: mtWidth,
        levelOpen: 'expand',
        levelSpacing: 25,
        closeOpenLevels: false,
        closeActiveLevel: false,
        expanded: false
    });

    // book pages navigation
    let pageHref = window.location.href.split("#")[0];
    let disablePrev = true,
        disableNext = true;

    $('#navMain a').map(function(){return this.href}).get().forEach( (v,i,a)=>{
        if( v === pageHref ){
            if( a[i-1] !== undefined ){
                prevPage.attr('href', a[i-1]);
                disablePrev = false;
            }
            if( a[i+1] !== undefined ){
                nextPage.attr('href', a[i+1]);
                disableNext = false;
            }
        }
    });
    if( !disablePrev ){
        prevPage.removeClass('disabled');
    }
    if( !disableNext ){
        nextPage.removeClass('disabled');
    }

    window.DC2.nav = $nav.data('hcOffcanvasNav');

    /*
    window.DC2.nav.on('open.level', (e, settings) => {
        console.log('NavLevel', e.data.currentLevel, 'NavIndex', e.data.currentIndex);
    });
     */
    window.DC2.nav.on('open', (e, settings) => {
        let actives = $('#navMain [data-nav-index]');
        if( actives.length ){
            let node2 = actives[actives.length - 1];
            // console.log('try to open:', $(node2).attr('data-nav-level'), $(node2).attr('data-nav-index'));
            window.DC2.nav.open($(node2).attr('data-nav-level'), $(node2).attr('data-nav-index'));
        }
    });

});
