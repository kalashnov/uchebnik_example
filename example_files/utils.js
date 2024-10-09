/* global DC2_FORMS_POSITIVE_NUMBER_REQUIRED, DC2_FORMS_PASSWORD_REQUIRED, DC2_FORMS_EMAIL_REQUIRED, DC2_FORMS_PHONE_REQUIRED, DC2_FORMS_ONLY_DIGITS, DC2_FORMS_REQUIRED_FIELD, DC2_CONFIRM_DO_DELETE, DC2_GALLERY_EraseGalleryAreYouShure, DC2_GALLERY_EraseGalleryImageAreYouShure, lightbox, DC2_OBJECT_CHANGE_STATUS */

var DC2 = {
    tinymce: [],
    CodeMirror: [],
    tokenizer: [],
    nav: [],
    nonce: '',
    eTest: [],
    promises: []
};

/**
 *
 * @param {{}} location - Window.location
 * @param {string} name
 * @returns {string}
 */
function getParameterByName(location, name) {
    name = name.replace(/\[/, "\\[").replace(/]/, "\\]");
    let regex = new RegExp("[\\?" + "&" + "]" + name + "=([^" + "&" + "#]*)");
    let results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 *
 * @param {{}} location
 * @param {string} name
 * @returns {string}
 */
function getParameter(location, name) {
    return getParameterByName(location, name);
}



//Returns an integer representing the width of the browser window (without the scrollbar).
function getWindowWidth() {
    return $(document).width();
}

//Returns an integer representing the height of the browser window (without the scrollbar).
function getWindowHeight() {
    let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS) {
        return screen.height;
    }
    return window.innerHeight ? window.innerHeight : (document.getBoxObjectFor ? Math.min(document.documentElement.clientHeight, document.body.clientHeight) : ((document.documentElement.clientHeight !== 0) ? document.documentElement.clientHeight : (document.body ? document.body.clientHeight : 0)));
}

/**
 * calculate element width and height
 * @param el jq element
 * @param includeMargin boolean
 * @returns {{w: *, h: *}}
 */
function getWH(el, includeMargin = true) {

    if (typeof el === "undefined") {
        return {w: 0, h: 0};
    }

    if (typeof includeMargin === "undefined") {
        includeMargin = true;
    }
    let id = 'dc2core' + Math.floor(100000 + Math.random() * 100000);
    let temp = $('<div>')
        .prop('id', id)
        .css({position: 'absolute', right: '100vw', top: 0, width: '100vw'});

    $(temp).append(el);
    $('body').append(temp);
    let elTemp = $('#' + id);
    let wh = {
        w: elTemp.outerWidth(includeMargin),
        h: elTemp.outerHeight(includeMargin)
    };
    elTemp.remove();
    temp.remove();
    return wh;
}

//Returns an integer representing the scrollWidth of the window.
function getScrollWidth() {
    return document.all ? Math.max(Math.max(document.documentElement.offsetWidth, document.documentElement.scrollWidth), document.body.scrollWidth) : (document.body ? document.body.scrollWidth : ((document.documentElement.scrollWidth !== 0) ? document.documentElement.scrollWidth : 0));
}

//Returns an integer representing the scrollHeight of the window.
function getScrollHeight() {
    return document.all ? Math.max(Math.max(document.documentElement.offsetHeight, document.documentElement.scrollHeight), Math.max(document.body.offsetHeight, document.body.scrollHeight)) : (document.body ? document.body.scrollHeight : ((document.documentElement.scrollHeight !== 0) ? document.documentElement.scrollHeight : 0));
}


function HeightResizer(id) {
    if (document.getElementById(id)) {
        document.getElementById(id).style.height = Math.max(getWindowHeight(), getScrollHeight()) + 'px';
        $( window ).on( "resize", function() {
            HeightResizer(id);
        });
    }
}


function SwitchDivDisplay(DivID, msgSHOW, msgHIDE) {
    let CurrentState = document.getElementById(DivID).style.display;
    if (CurrentState === 'none') {
        document.getElementById(DivID + 'DisplaySwitcher').innerHTML = 'X';
        document.getElementById(DivID).style.display = 'inline';
        // location.href = "#Anc_" + DivName;
        DC2GetInterface(DC2_DefaultFormActionURL + 'SetOption&Option=' + DivID + '&Value=1', DC2_DefaultTarget, false);
    } else {
        document.getElementById(DivID + 'DisplaySwitcher').innerHTML = '+';
        document.getElementById(DivID).style.display = 'none';
        DC2GetInterface(DC2_DefaultFormActionURL + 'SetOption&Option=' + DivID + '&Value=0', DC2_DefaultTarget, false);
    }
}


function ToggleDivDisplay(DivID) {
    $('#' + DivID).toggle('slow');
}


function setCaretPosition(elemId, caretPos) {
    let elem = document.getElementById(elemId);

    if (elem !== null) {
        if (typeof elem.createTextRange === 'function') {
            let range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            } else
                elem.focus();
        }
    }
}


function redirect(url, forceBlank) {
    if (typeof forceBlank !== 'undefined' && forceBlank) {
        window.open(url);
        // let w = window.open(url);
        // w.focus();
    } else {
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            let referLink = document.createElement('a');
            referLink.href = url;
            document.body.appendChild(referLink);
            referLink.click();
        } else {
            location.href = url;
        }
    }
}

function Finaliser(URL) {
    if (typeof URL === 'undefined') {
        window.location.reload();
    } else {
        redirect(URL);
    }
}

var MAX_DUMP_DEPTH = 5;

function dumpObj(obj, name, indent, depth) {

    if (typeof name === 'undefined') {
        name = '';
    }
    if (typeof indent === 'undefined') {
        indent = "\t";
    }
    if (typeof depth === 'undefined') {
        depth = 0;
    }

    let indents = indent.repeat(depth + 1);

    if (depth > MAX_DUMP_DEPTH) {
        return indents + name + ": <Maximum Depth Reached>\n";
    }
    if (typeof obj === "object" && obj !== null) {
        let child = null;
        let output = name + ":\n";
        for (let item in obj) {
            try {
                child = obj[item];
            } catch (e) {
                child = '<Unable to Evaluate>';
            }

            if (child !== null && typeof child === 'object') {
                output += indents + dumpObj(child, item, indent, depth + 1);
            } else {
                output += indents + item + ": " + (child ? child : '') + "\n";
            }
        }
        return output;
    } else {
        return obj;
    }
}

/**
 * verify field
 * @param {object} f DOM object
 * @param {string} testmod check string
 * @returns {Boolean}
 */
function DC2_FormVerifyField(f, testmod) {
    switch (testmod) {
        case '*':
        case 'p':
            // password 
            if (f.value === '' ||
                f.value.search && f.value.search(new RegExp("^.{4,32}$", "g")) < 0) {
                f.style.border = '3px solid crimson';
                alert(DC2_FORMS_PASSWORD_REQUIRED);
                f.focus();
                return false;
            } else {
                f.style.border = '';
            }
            break;
        case '@':
            // email
            // console.log(f.value, /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/g);
            if (f.value !== '' &&
                f.value.search(/^([-_.0-9a-zA-Z]+)@(([-_0-9a-zA-Z]+\.?)+)\.([a-zA-Z]{2,11})$/) < 0
                // f.value.search(/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/g) < 0
                // f.value.search(new RegExp("^[a-zA-Z0-9][a-zA-Z0-9\._\-]{0,70}@[a-zA-Z0-9_\-]{1,70}(\.[a-zA-Z0-9_\-]{2,32}){2,5}$", "g")) < 0
                // f.value.search(new RegExp("^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$", "g")) < 0
            ) {
                // console.log(f.value, f.value.search(/^([-_\.0-9a-zA-Z]+)@(([-_0-9a-zA-Z]+[\.]{0,1})+)[\.]([a-zA-Z]{2,11})$/), '/^([-_\.0-9a-zA-Z]+)@(([-_0-9a-zA-Z]+[\.]{0,1})+)[\.]([a-zA-Z]{2,11})$/');
                f.style.border = '3px solid crimson';
                alert(DC2_FORMS_EMAIL_REQUIRED);
                f.focus();
                return false;
            } else {
                f.style.border = '';
            }
            break;
        case '#':
            // phone mask 
            if (f.value !== '' && f.value.search(/^[+]?(\d{1,3}) ?\(?(\d{3})\)?[ \-]?(\d{3})[ \-]?(\d{2})[ \-]?(\d{2}) ?((( |ext|ex|доб|д)\.?)? ?[\d\-]{2,4})?$/g) < 0) {
                f.style.border = '3px solid crimson';
                alert(DC2_FORMS_PHONE_REQUIRED);
                f.focus();
                return false;
            } else {
                f.style.border = '';
            }
            break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            // numbers only
            if (f.value === '' ||
                f.value.search && f.value.search(new RegExp("^[0-9]*$", "g")) < 0) {
                f.style.border = '3px solid crimson';
                alert(DC2_FORMS_ONLY_DIGITS);
                f.focus();
                return false;
            } else {
                f.style.border = '';
            }
            break;
        case '!':
            // non-empty
            if (f.value === '') {
                f.style.border = '3px solid crimson';
                alert(DC2_FORMS_REQUIRED_FIELD);
                f.focus();
                return false;
            } else {
                f.style.border = '';
            }
            break;
        case '!0':
            // non empty and not null/zero
            if (f.value === '' || parseInt(f.value) === 0) {
                f.style.border = '3px solid crimson';
                alert(DC2_FORMS_POSITIVE_NUMBER_REQUIRED);
                f.focus();
                return false;
            } else {
                f.style.border = '';
            }
            break;
        case 'a':
            // alpha only
            break;
        case 'an':
            // alpha-num only
            break;
        default:
            // alert('unknown modifier ' + i['type'] + ' on ' + fid);
            console.error('unknown modifier ' + testmod + ' on ' + f.id);
            return false;

    }
    return true;
}

/**
 * verify form
 * @param {{}} form  {FormId:'id', inputs: {id1:'checktype1', id2: ['ct2', 'ct3']}}
 * @returns {Boolean}
 */
function DC2_FormVerify(form) {
    if (typeof form === 'undefined') {
        return true;
    }

    if (typeof form['FormId'] === 'undefined') {
        alert('Missing FormId');
        return false;
    }
    let FormId = form['FormId'];
    if (!document.getElementById(FormId)) {
        alert('Missing form with Id ' + FormId);
        return false;
    }
    // let theForm = document.getElementById(FormId);

    if (typeof form['inputs'] === 'undefined') {
        alert('Missing form inputs list');
        return false;
    }
    for (let i in form['inputs']) {
        let fid = i;
        if (!document.getElementById(fid)) {
            alert('missing field id ' + fid);
            return false;
        }
        let f = document.getElementById(fid);

        if (form['inputs'][fid] instanceof Array) {
            let l = form['inputs'][fid].length;
            for (let ci = 0; ci < l; ci++) {
                // console.log('291', fid, form['inputs'][fid][ci]);
                if (!DC2_FormVerifyField(f, form['inputs'][fid][ci])) {
                    return false;
                }
            }

        } else {
            // console.log('298', fid, form['inputs'][fid]);
            if (!DC2_FormVerifyField(f, form['inputs'][fid])) {
                return false;
            }
        }
    }
    return true;
}


//
// AJAX connector
//
var DC2_DefaultTarget = 'DC2AjaxerNULL'; // 'DC2AjaxerNULL'; 'DynacontDebugPannel';
var DC2_DefaultFormName = 'DC2Ajaxer';
var DC2_DefaultFormActionURL = '/sys/rpc.php?cmd=';
var DC2_RegisteredDialogs = [];


function DC2_AJAX_ResetForm(FormName, ActionURL) {
    if (document.getElementById(FormName)) {
        document.getElementById(FormName).method = 'post';
        document.getElementById(FormName).target = '';
        document.getElementById(FormName).action = ActionURL;
    }
}

function DC2_AJAX_SetArg(ArgName, ArgValue) {
    if (document.getElementById(ArgName)) {
        document.getElementById(ArgName).value = ArgValue;
    } else {
        alert(ArgName + ' is missing.');
    }
}

var DC2_AJAX_Results = '{"status":false,"message":"No DATA."}';

/**
 *
 */

var DC2_AJAX_Bisy = false;
var DC2_AJAX_BisyCnt = 0;


/**
 *
 * @param {string} RpcUrl
 * @param {function|string|boolean} OnSuccessExec
 * @returns {void}
 */
function DC2_AJAX_JSON_Exec(RpcUrl, OnSuccessExec) {
    DC2GetInterfaceJSON(RpcUrl, OnSuccessExec);
}


/**
 *
 * @param {string} RpcUrl - RPC entrypoint
 * @param {string} TargetElement - target div
 * @param {function|string|boolean} OnSuccessExec - callback
 * @param {string} DefaultFormActionURL
 * @param {string} DefaultFormName
 * @param {int} DefaultTimeout
 * @returns {void}
 */
function DC2_AJAX_Exec(RpcUrl, TargetElement, OnSuccessExec, DefaultFormActionURL, DefaultFormName='DC2Ajaxer', DefaultTimeout=600000) {
    DC2GetInterface(RpcUrl, TargetElement, OnSuccessExec, DefaultFormName, DefaultTimeout);
}


function DC2_RemoveObject(id, pid) {
    if (confirm(DC2_CONFIRM_DO_DELETE)) {
        DC2GetInterface(
            '/sys/DC2_StorageObjectEdit.php?Action=delete&id=' + id + '&pid=' + pid,
            false,
            function(){
                window.location.reload()
            }
        );
    }
}


function DC2_CapchaRegen(TargetID, CapchaID, Hash) {
    let RpcUrl = DC2_DefaultFormActionURL + 'CaptchaRegen' + '&' + 'CaptchaName=' + CapchaID + '&' + 'CaptchaHash=' + Hash;
    DC2GetInterface(RpcUrl, TargetID, false);
    return false;
}

function DC2_ChangeObjectStatus(id, size, displaytext) {
    if (confirm(DC2_OBJECT_CHANGE_STATUS)) {
        let RpcUrl = DC2_DefaultFormActionURL + 'ChangeStatus' + '&' + 'id=' + id + '&' + 'size=' + size + '&' + 'displaytext=' + displaytext;
        DC2GetInterface(RpcUrl, 'DC2ObjectStatus_' + id, false);
    }
    return false;
}

/**
 *
 * @param {string} fldID
 * @param {mixed} value
 * @returns {Boolean}
 */
function DC2_InitSelectorControl(fldID, value) {
    let selector = document.getElementById(fldID);
    if (!selector) {
        return false;
    }
    for (let i = 0; i < selector.options.length; i++) {
        if (selector.options[i].value === value) {
            selector.options[i].selected = true;
            selector.selectedIndex = i;
        } else {
            selector.options[i].selected = false;
        }
    }
    return true;
}


function DC2_URL_Parse(url) {
    let argv = [];
    let idx = url.indexOf('?');

    if (idx !== -1) {
        argv[0] = url.substring(0, idx);
        let pairs = url.substring(idx + 1, url.length).split('&');
        for (let i = 0; i < pairs.length; i++) {
            let nameVal = pairs[i].split('=');
            argv[nameVal[0]] = nameVal[1];
        }
    }
    return argv;
}

function DC2_URL_Compose(argv) {
    let s = argv[0] + '?';
    let first = true;
    for (let v in argv) {
        if (v !== 0) {
            if (!first) {
                s += '&';
            }
            s += v + '=' + argv[v];
            first = false;
        }
    }
    return s;
}

/*
 ** Abstract modal dialog
 */

var XDataDialog = false;

//
// RATING Subsystem
//
function DCRate(id, n, m) {
    let nF = Math.floor(n);
    let d;

    document.getElementById('DCRating' + id).style.width = (26 * (m + 1) + 1) + 'px';
    if (n - nF <= 0.25) {
        d = 0;
    } else if (n - nF >= 0.75) {
        d = 1;
        nF++;
    } else {
        d = 0.5;
    }
    for (let i = 1; i <= nF; i++) {
        document.getElementById('DCRate' + id + '_' + i).className = "DCRateStar1";
    }
    for (let i = nF + 1; i <= m; i++) {
        document.getElementById('DCRate' + id + '_' + i).className = "DCRateStar0";
    }
    if (d === 0.5) {
        document.getElementById('DCRate' + id + '_' + (nF + 1)).className = "DCRateStar05";
    }
}

function DCDoRate(id, n) {
    let RpcUrl = DC2_DefaultFormActionURL + 'RateDocument' + '&' + 'id=' + id + '&' + 'r=' + n;
    DC2GetInterface(RpcUrl, 'DCRatingBox' + id, false);
}


/*
 * Glossary
 **/
function DC2GlossaryArticles(id, a) {
    let RpcUrl = '/sys/modules/category/category-rpc.php?cmd=' + 'GlossaryLetter' + '&' + 'id=' + id + '&' + 'a=' + a;
    DC2GetInterface(RpcUrl, 'CategoryArticleContainer', false);
}


/*
 * Article pager
 */
var DC2ArticleListCurrentPage = 0;

function DC2_ArticleList_CheckPage(response) {
    let getNP = $('#ArticleListGetNextPage');
    if (response.result === '') {
        getNP.css({display: 'none!important'});
        return;
    }
    getNP.before(response.result);
}

function DC2_ArticleList_NextPage(ListMode, ContextIDs, TemplateBase, pageSize) {
    DC2ArticleListCurrentPage++;

    if (typeof TemplateBase === 'undefined') {
        TemplateBase = 'ArticleList';
    }
    if (typeof pageSize === "undefined") {
        pageSize = 9;
    }

    let RpcUrl = '/sys/modules/category/category-rpc.php?cmd=' + 'DisplayArticlesPage' +
        '&' + 'page=' + DC2ArticleListCurrentPage +
        '&' + 'mode=' + ListMode +
        '&' + 'context=' + ContextIDs +
        '&' + 'templatebase=' + TemplateBase +
        '&' + 'pageSize=' + pageSize +
        '';

    DC2GetInterface(RpcUrl, 'DC2AjaxerNULL', DC2_ArticleList_CheckPage);
}

/*
 * News pager
 */
var DC2NewsListCurrentPage = 0;

function DC2_NewsList_CheckPage(response) {
    let showMore = $('#NewsShowMoreButton');
    if (response.result === '') {
        showMore.css({display: 'none'});
        return;
    }
    showMore.before(response.result + '<div class="clearfix"/>');
}

function DC2_NewsList_NextPage(ListMode, ContextIDs, TemplateBase, pageSize) {
    DC2NewsListCurrentPage++;

    if (typeof TemplateBase === 'undefined') {
        TemplateBase = 'NewsList';
    }
    if (typeof pageSize === "undefined") {
        pageSize = 9;
    }

    let RpcUrl = '/sys/modules/category/category-rpc.php?cmd=' + 'DisplayNewsPage' +
        '&' + 'page=' + DC2NewsListCurrentPage +
        '&' + 'mode=' + ListMode +
        '&' + 'context=' + ContextIDs +
        '&' + 'templatebase=' + TemplateBase +
        '&' + 'pageSize=' + pageSize +
        '';

    DC2GetInterface(RpcUrl, 'DC2AjaxerNULL', DC2_NewsList_CheckPage);
}


/**
 * objects pager
 */
var dc2ObjListCurrentPage = 0;

function dc2ObjListCheckPage(el, response) {
    if (response.result === '') {
        $(el).css({display: 'none'});
        return;
    }
    $(el).before(response.result + '<div class="clearfix"/>');
}

function dc2ObjListNextPage(el, listCmd, contextID, templateBase, pageSize, source) {
    dc2ObjListCurrentPage++;

    if (typeof templateBase === 'undefined') {
        templateBase = 'ObjectAnnotation';
    }
    if (typeof pageSize === "undefined") {
        pageSize = 9;
    }
    if (typeof source === 'undefined') {
        source = ''
    }

    let RpcUrl = '/sys/modules/category/category-rpc.php?cmd=' + 'displayObjects' +
        '&' + 'page=' + dc2ObjListCurrentPage +
        '&' + 'mode=' + listCmd +
        '&' + 'context=' + contextID +
        '&' + 'templatebase=' + templateBase +
        '&' + 'pageSize=' + pageSize +
        '&' + 'source=' + source +
        '';

    DC2GetInterface(RpcUrl, 'DC2AjaxerNULL', function (response) {
        dc2ObjListCheckPage(el, response);
    });
}

// -----------------------------------------------------------------------------
// Input repeaters
// -----------------------------------------------------------------------------
/* Example code:
 
 <script type="text/javascript">
 function myInitRepeaters(){
 DC2_Repeater['T'] = new Array();
 DC2_Repeater['T']['MaxNodes'] = 5;
 DC2_Repeater['T']['NextNode'] = 1;
 DC2_Repeater['T']['NNodes'] = 0;
 DC2_Repeater['T']['inputs'] = new Array();
 DC2_Repeater['T']['inputs']['aaa'] = ['text', 'width:200px', 'aaaaa'];
 DC2_Repeater['T']['inputs']['bbb'] = ['text', 'width:90px', 'bbbbbb'];
 DC2_Repeater['T2'] = new Array();
 DC2_Repeater['T2']['MaxNodes'] = 3;
 DC2_Repeater['T2']['NextNode'] = 1;
 DC2_Repeater['T2']['NNodes'] = 0;
 DC2_Repeater['T2']['inputs'] = new Array();
 DC2_Repeater['T2']['inputs']['aaa'] = ['text', 'width:90px', 'aaaa'];
 DC2_Repeater['T2']['inputs']['bbb'] = ['text', 'width:150px', 'bbbb'];
 DC2_Repeater['T2']['inputs']['ccc'] = ['text', 'width:150px', 'cccc'];
 DC2_InitRepeaters(['T', 'T2']);
 }
 YAHOO.util.Event.onDOMReady(myInitRepeaters);
 </script>
 
 <form id="JSONify" action="#" method="post" onsubmit="return DC2_JSONify(['T','T2'])">
 <div class="Repeater">
 <div class="RepeaterTitle">Образование:</div>
 <div class="RepeaterContainer" id="T_RepeaterContainer"></div>
 <input type="hidden" name="T" id="T" value="<?= isset($_POST['T']) ? htmlspecialchars($_POST['T']) : '' ?>"/>
 </div>
 
 <div class="Repeater">
 <div class="RepeaterTitle">Образование 2:</div>
 <div class="RepeaterContainer" id="T2_RepeaterContainer"></div>
 <input type="hidden" name="T2" id="T2" value="<?= isset($_POST['T2']) ? htmlspecialchars($_POST['T2']) : '' ?>"/>
 </div>
 <input value="Зарегистрироваться" type="submit"/>
 </form>
 
 **/

var DC2_Repeater = [];


function RepeaterModifySelector(inp, options, ivalue) {
    for (let opti in options) {
        let opt = document.createElement('option');
        opt.innerHTML = options[opti][1];
        opt.setAttribute('value', options[opti][0]);

        if (ivalue === options[opti][0] || ivalue === options[opti][1]) {
            opt.setAttribute('selected', 'selected');
        }
        inp.appendChild(opt);
    }
}


function RepeaterAddRow(ClassName, Container, RowData) {
    let i, inp, dthth;
    let d = document.createElement('div');
    d.setAttribute('class', 'RepeaterRow');
    let nnodeID = DC2_Repeater[ClassName]['NextNode'];
    d.setAttribute('id', ClassName + '_' + nnodeID);

    if (nnodeID === 1) {
        // create titles on the first call
        let dth = document.createElement('div');

        dth.setAttribute('class', 'RepeaterRow RepeaterRowTitle');
        for (i in DC2_Repeater[ClassName]['inputs']) {
            dthth = document.createElement('div');

            dthth.setAttribute('id', ClassName + '_th_' + i);
            dthth.setAttribute('style', 'display:inline-block;' + DC2_Repeater[ClassName]['inputs'][i][1]);
            dthth.innerHTML = DC2_Repeater[ClassName]['inputs'][i][2];

            dth.appendChild(dthth);
        }

        dthth = document.createElement('div');

        dthth.setAttribute('id', ClassName + '_th_Ctls_0');
        dthth.setAttribute('style', 'display:inline-block;');

        inp = document.createElement('input');
        // inp.setAttribute('style', 'display:inline-block;');
        inp.setAttribute('type', 'image');
        inp.setAttribute('src', '/images/16x16/add.png');
        inp.setAttribute('onclick', 'DC2_RepeaterAdd(\'' + ClassName + '\');return false;');
        dthth.appendChild(inp);
        dth.appendChild(dthth);
        Container.appendChild(dth);

    }

    DC2_Repeater[ClassName]['NextNode']++;
    // var index = 0;

    let itype = 'text';
    let idiv;
    for (i in DC2_Repeater[ClassName]['inputs']) {
        idiv = document.createElement('div');
        idiv.setAttribute('style', 'display:inline-block;' + DC2_Repeater[ClassName]['inputs'][i][1]);
        idiv.setAttribute('id', 'ibox_' + ClassName + '_' + nnodeID + '_' + i);
        d.appendChild(idiv);
        // alert(ClassName+': '+DC2_Repeater[ClassName]['inputs'][i].toString());

        if (DC2_Repeater[ClassName]['inputs'][i][0] === 'select') {
            itype = 'select';
            inp = document.createElement('select');
        } else {
            itype = 'text';
            inp = document.createElement('input');
            inp.setAttribute('type', itype);
        }
        let inputID = ClassName + '_' + nnodeID + '_' + i;
        inp.setAttribute('id', inputID);
        inp.setAttribute('name', ClassName + '[' + nnodeID + '][' + i + ']');

        let ivalue = '';
        if (RowData) {
            ivalue = RowData[i];
        } else {
            ivalue = '';
        }

        if (itype === 'select') {
            let options = DC2_Repeater[ClassName]['inputs'][i][3];
            for (let opti in options) {
                let opt = document.createElement('option');
                let value, display;

                if (typeof (options[opti]) === 'string') {
                    value = opti; // Attention: logic changed was options[opti]
                    display = options[opti];
                } else if (typeof (options[opti]) === 'object') {
                    value = options[opti][0];
                    display = options[opti][1];
                } else {
                    alert(inputID + ': Option should be string or 2 elements array!');
                    return;
                }

                opt.innerHTML = display;
                opt.setAttribute('value', value);
                if (ivalue === value) {
                    opt.setAttribute('selected', 'selected');
                }
                inp.appendChild(opt);
            }

            if (typeof DC2_Repeater[ClassName]['inputs'][i][4] !== 'undefined') {
                inp.setAttribute('onchange', DC2_Repeater[ClassName]['inputs'][i][4] + "('" + inputID + "')");
            }

        } else {
            inp.setAttribute('value', ivalue);
        }
        inp.setAttribute('style', 'width:93%;');

        idiv.appendChild(inp);
    }

    idiv = document.createElement('div');
    idiv.setAttribute('style', 'display:inline-block;');
    idiv.setAttribute('id', 'ibox_' + ClassName + '_' + nnodeID + '_Ctls_0');
    d.appendChild(idiv);

    inp = document.createElement('input');
    inp.setAttribute('style', 'display:inline-block;');
    inp.setAttribute('type', 'image');
    inp.setAttribute('src', '/images/16x16/remove.png');
    inp.setAttribute('onclick', 'DC2_RepeaterRemove(\'' + ClassName + '\', ' + nnodeID + ');return false;');
    idiv.appendChild(inp);
    DC2_Repeater[ClassName]['NNodes']++;

    Container.appendChild(d);
}

function DC2_RepeaterAdd(ClassName) {
    let Container = document.getElementById(ClassName + '_RepeaterContainer');
    if (!Container) {
        alert(ClassName + '_RepeaterContainer !');
        return false;
    }
    if (DC2_Repeater[ClassName]['NNodes'] >= DC2_Repeater[ClassName]['MaxNodes']) {
        return false;
    }

    RepeaterAddRow(ClassName, Container, false);

    return false;
}

function DC2_RepeaterRemove(ClassName, NodeID) {
    if (DC2_Repeater[ClassName]['NNodes'] > 1 || (DC2_Repeater[ClassName]['AllowEmpty'] && DC2_Repeater[ClassName]['NNodes'] > 0)) {
        let d = document.getElementById(ClassName + '_RepeaterContainer');
        if (d) {
            let dc = document.getElementById(ClassName + '_' + NodeID);
            if (dc) {
                d.removeChild(dc);
                DC2_Repeater[ClassName]['NNodes']--;
            }
        } else {
            alert(ClassName + '_RepeaterContainer !');
        }
    }
}

function DC2_CollectRepeaterData(ClassName) {
    let Data = [];
    let i = 0;
    let ErrorFocus = '';
    let ErrorFocus1st = '';
    let d = document.getElementById(ClassName + '_RepeaterContainer');
    if (typeof DC2_Repeater[ClassName] === 'undefined') {
        alert(ClassName + ' is undefined Class!');
        return false;
    }
    if (d) {
        for (let NodeID = 1; NodeID < DC2_Repeater[ClassName]['NextNode']; NodeID++) {
            let dc = document.getElementById(ClassName + '_' + NodeID);
            if (dc) {
                let tData = {};
                let isData = 0;
                let j = 0;
                for (let inp in DC2_Repeater[ClassName]['inputs']) {
                    ErrorFocus = ClassName + '_' + NodeID + '_' + inp;
                    if (ErrorFocus1st === '') {
                        ErrorFocus1st = ErrorFocus;
                    }
                    let inputf = document.getElementById(ErrorFocus);
                    if (inputf) {
                        if (typeof inputf.value !== 'undefined') {
                            if (inputf.value.toString() !== '' && inputf.value !== 0) {
                                isData++;
                            }
                            tData[inp] = '' + inputf.value;
                        }
                        j++;
                    }
                }
                if (isData) {
                    Data[i] = tData;
                    i++;
                }
            }
        }
        // alert(Data);
        if (!DC2_Repeater[ClassName]['AllowEmpty'] && i === 0) {
            if (document.getElementById(ErrorFocus1st)) {
                document.getElementById(ErrorFocus1st).focus();
                document.getElementById(ErrorFocus1st).style.border = '1px solid red';
                alert(DC2_Repeater[ClassName]['OnEmptyMessage']);
            } else {
                alert('Focus field not found: ' + ErrorFocus1st);
            }
            return false;
        } else {
            if (document.getElementById(ErrorFocus1st)) {
                document.getElementById(ErrorFocus1st).style.border = '';
            }
        }
    } else {
        alert(ClassName + '_RepeaterContainer is missing!');
        return false;
    }
    return Data;
}

function DC2_JSONify(Repeaters) {
    for (let r in Repeaters) {
        // alert(Repeaters[r]);
        let ClassName = Repeaters[r];
        let Data = DC2_CollectRepeaterData(ClassName);
        if (Data) {
            document.getElementById(ClassName).value = JSON.stringify(Data);
        } else {
            return false;
        }
        //document.getElementById(ClassName).value = JSON.stringify(Data);
        // alert(document.getElementById(ClassName).value);
    }
    return true;
}

function DC2_InitRepeaters(Repeaters, FoceRecreate) {
    // alert(Repeaters.toString());
    if (typeof Repeaters === 'undefined') {
        return false;
    }
    if (typeof FoceRecreate === 'undefined') {
        FoceRecreate = false;
    }
    for (let r in Repeaters) {
        // alert(Repeaters[r]);
        let ClassName = Repeaters[r];
        let Container = document.getElementById(ClassName + '_RepeaterContainer');
        if (!Container) {
            alert('Container ' + ClassName + '_RepeaterContainer not found!');
        } else {
            let DataT = document.getElementById(ClassName);
            if (DataT) {
                // var rowCounter = 0;
                let Data;

                if (FoceRecreate || typeof DC2_Repeater[ClassName] === 'undefined') {
                    if (!document.getElementById(ClassName + '_Def')) {
                        alert('Class def is undefined for ' + ClassName);
                        return false;
                    }
                    DC2_Repeater[ClassName] = JSON.parse(document.getElementById(ClassName + '_Def').value);
                    // alert(document.getElementById(ClassName+'_Def').value);
                    // dumpObj(DC2_Repeater[ClassName], ClassName);
                }
                DC2_Repeater[ClassName]['NNodes'] = 0;
                DC2_Repeater[ClassName]['NextNode'] = 1;

                if (typeof DC2_Repeater[ClassName]['Data'] !== 'undefined') {
                    Data = DC2_Repeater[ClassName]['Data'];
                } else if (DataT.value !== '') {
                    Data = JSON.parse(DataT.value);
                } else {
                    Data = [];
                }
                for (let row in Data) {
                    let Isdata = false;
                    for (let col in DC2_Repeater[ClassName]['inputs']) {
                        if (Data[row][col] !== '') {
                            Isdata = true;
                        }
                    }
                    if (Isdata) {
                        RepeaterAddRow(ClassName, Container, Data[row]);
                        // rowCounter++;
                    }
                }
                // if( rowCounter < DC2_Repeater[ClassName]['MaxNodes'] ){
                RepeaterAddRow(ClassName, Container, false);
                // }
            } else {
                alert('No data for ' + ClassName);
            }
        }
    }
    return true;
}


var DC2_ModalDialog = [];
var DC2_ModalDialogNode = [];


function DC2_CloseDialog() {
    this.hide();
}


function DC2_DialogVerify(Dialog) {
    let C = Dialog['Controls']['Control'];
    for (let i in C) {
        if (typeof C[i].onsubmit !== 'undefined' && C[i].onsubmit !== '') {
            let f = window[C[i].onsubmit];
            if (typeof f !== 'undefined') {
                if (!f(C[i].id)) {
                    return false;
                }
            } else {
                alert('Verify: ' + C[i].onsubmit + '() declaration is missing!');
            }
        }
    }
    return true;
}

function DC2_DialogOnSubmit(DC2Config) {
    if (!DC2_DialogVerify(DC2Config)) {
        return false;
    }

    // process dialog data
    let Data = {};
    for (let c in DC2Config['Controls']['Control']) {
        if (DC2Config['Controls']['Control'][c].type !== 'repeater') {
            let id = DC2Config['Controls']['Control'][c].id;
            Data[id] = '' + $('#' + id).value;
        } else {
            let repeater = DC2Config['Controls']['Control'][c].id;
            let dialogID = DC2Config.id;
            let repeaterObj = $('#' + dialogID + '_tr_' + repeater);
            if ( repeaterObj.length ) {
                if (repeaterObj.style.display !== 'none') {
                    Data[repeater] = DC2_CollectRepeaterData(repeater);
                    if (!Data[repeater]) {
                        return false;
                    }
                }
            } else {
                alert('Repeater ' + repeater + ' not found!');
            }
        }
    }
    let obj = $('#' + DC2Config.id);
    if ( obj.length ) {
        obj.val(JSON.stringify(Data));
    }
    return true;
}

function DC2_DialogNonempty(f) {
    let el = document.getElementById(f);
    if (el) {
        if (el.value === '') {
            el.focus();
            el.style.border = '1px solid red';
            alert('Это поле должно быть заполнено!');
            return false;
        } else {
            el.style.border = '';
        }
    }
    return true;
}

var cursorX = 0;
var cursorY = 0;
document.onmousemove = function (e) {
    if (e && e.pageX && e.pageY) {
        cursorX = e.pageX;
        cursorY = e.pageY;
    }
};


function DC2_InitDialog(Dialog) {
    let i, f;

    if (Dialog['status'] !== 'success') {
        console.error(Dialog['message']);
        return false;
    }

    if (typeof Dialog['id'] === 'undefined') {
        console.error('Dialog id is missing!');
        return false;
    }

    if (typeof Dialog['container'] === 'undefined') {
        console.error('Dialog container is missing!');
        return false;
    }

    if (typeof Dialog['Controls'] === 'undefined') {
        console.error('Oops!!! Dialog has no controls!');
        return false;
    }

    // cleanup previous dialog with the same name if it exists
    if (DC2_ModalDialog[Dialog['id']] ){
        let dlg = $("#DC2_Dialog_" + Dialog['id']);
        if( dlg.length ) {
            dlg.dialog('destroy').remove();
        }
    }


    // process buttons
    let Buttons = [];
    let B = Dialog['Controls']['Buttons'];
    for (i in B) {
        let function_name = window[B[i]];
        if (typeof function_name !== 'undefined') {
            Buttons.push({
                text: i,
                click: function_name,
                class: 'dc2input'
            });
        } else {
            alert('Buttons: Unknown function ' + B[i]);
        }
    }

    // create one...
    DC2_ModalDialog[Dialog['id']] = $('<div id="DC2_Dialog_' + Dialog['id'] + '">'
        + (typeof Dialog['DialogBody'] !== 'undefined' ? Dialog['DialogBody'] : 'Dialog body is empty!')
        + '</div>').dialog({
        modal: true,
        show: 'fade',
        hide: 'fade',
        closeOnEscape: true,
        draggable: true,
        width: typeof Dialog['width'] === 'undefined' ? Math.min(1200, 0.7 * getWindowWidth()) : Dialog['width'],
        title: typeof Dialog['DialogHeader'] !== 'undefined' ? Dialog['DialogHeader'] : 'DialogHeader is not set!',
        buttons: Buttons
    });


    // after rendering perform oninit and initialise onchange
    let C = Dialog['Controls']['Control'];
    if (typeof C !== 'undefined') {
        for (i in C) {
            if (!document.getElementById(C[i].id)) {
                alert('handlers: ' + C[i].id + ' is not in DOM!');
            } else {
                if (C[i].oninit && C[i].oninit !== '') {
                    f = window[C[i].oninit];
                    if (typeof f !== 'undefined') {
                        f(C[i].id);
                    } else {
                        alert(C[i].id + ' oninit: ' + C[i].oninit + '() declaration is missing!');
                    }
                }
                if (C[i].onchange && C[i].onchange !== '') {
                    f = window[C[i].onchange];
                    if (typeof f !== 'undefined') {
                        document.getElementById(C[i].id).onchange = f;
                    } else {
                        alert(C[i].id + ' onchange: ' + C[i].onchange + '() declaration is missing!');
                    }
                }
                if (C[i].onfocus && C[i].onfocus !== '') {
                    f = window[C[i].onfocus];
                    if (typeof f !== 'undefined') {
                        document.getElementById(C[i].id).onfocus = f;
                    } else {
                        alert(C[i].id + ' onfocus: ' + C[i].onfocus + '() declaration is missing!');
                    }
                }
                if (C[i].onclickexp && C[i].onclickexp !== '') {
                    document.getElementById(C[i].id).onclick = C[i].onclickexp;
                } else if (C[i].onclick && C[i].onclick !== '') {
                    f = window[C[i].onclick];
                    if (typeof f !== 'undefined') {
                        document.getElementById(C[i].id).onclick = f;
                    } else {
                        alert(C[i].id + ' onclick: ' + C[i].onclick + '() declaration is missing!');
                    }
                }
            }
        }
    }

    DC2_ModalDialog[Dialog['id']].DC2Config = Dialog;
    DC2_InitRepeaters(Dialog['Repeaters'], true);

    // DC2_ModalDialog[Dialog['id']].show();
    // DC2_ModalDialog[Dialog['id']].center();
    if (typeof Dialog['focus'] !== 'undefined' && Dialog['focus']) {
        f = document.getElementById(Dialog['focus']);
        if (typeof f !== 'undefined') {
            f.focus();
        } else {
            alert('autofocus: ' + Dialog['focus'] + ' is not in DOM!');
        }
    }


    return DC2_ModalDialog[Dialog['id']];
}



// -----------------------------------------------------------------------------
// Project specific js
// -----------------------------------------------------------------------------

//
// Project registration. Validation form. Only russian locale right now.
//
function ValidateProjectRegistrationForm() {
    let cF = ['p_ProjectName'
        //		, 'p_ProjectPathName'
        , 'p_info'];
    let cFmsg = ['Пожалуйста, укажите название проекта',
        //		, 'Пожалуйста, укажите английскую аббревиатуру названия проекта.\nЭта информация будет использована для создания пути к проекту.'
        'Пожалуйста, кратко опишите Ваш проект'];
    for (let i = 0; i < cF.length; i++) {
        if (document.getElementById(cF[i]) && document.getElementById(cF[i]).value === '') {
            document.getElementById(cF[i]).style.border = '3px solid red';
            alert(cFmsg[i]);
            document.getElementById(cF[i]).focus();
            return false;
        } else {
            document.getElementById(cF[i]).style.border = '1px solid #aaa';
        }
    }

    return confirm("\n\nВнимание! Вы уверены, что все правильно заполнили?\n\n ");
}


/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    let userAgent = window.navigator.userAgent;

    let msie = userAgent.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(userAgent.substring(msie + 5, userAgent.indexOf('.', msie)), 10);
    }

    let trident = userAgent.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        let rv = userAgent.indexOf('rv:');
        return parseInt(userAgent.substring(rv + 3, userAgent.indexOf('.', rv)), 10);
    }

    let edge = userAgent.indexOf('Edge/');
    if (edge > 0) {
        // IE 12 => return version number
        return parseInt(userAgent.substring(edge + 5, userAgent.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

// JQ based staff

/**
 *
 * @param {{}} form
 * @returns {Boolean}
 */
function SubscriptionSubscribe(form) {
    if (!DC2_FormVerify(form)) {
        return false;
    }

    document.getElementById('SubscriptionForm').style.display = 'none';
    DC2GetInterface(
        '/sys/modules/Subscription/Subscription-rpc.php?cmd=FastSubscribe', //  + q
        form['FormId'] + 'Results',
        false,
        'SubscriptionForm',
    );
}

/**
 * returns all form data fields
 * @param {string} formID form ID selector example '#myForm'
 * @returns {{}|*}
 * @constructor
 */
function DC2GetFormData(formID) {
    let form = $(formID);
    if (form.length === 0) {
        return {};
    } else {
        return form.serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
    }
}

/**
 *
 * @type String
 */
var DC2PleaseWaitText = '<div id="DC2PleaseWaitBlock" class="DC2PleaseWaitBlock">' +
    '<img src="/images/spin.gif" style="display:block;margin:0.5em auto;" alt="wait..."/><br/>' +
    'Пожалуйста, подождите. Выполняется длительная операция...' +
    '<div id="DC2PleaseWaitTextInfo" class="DC2PleaseWaitTextInfo"></div>' +
    '</div>';

/**
 *
 * @param {string} url
 * @param {string|boolean} target
 * @param {function|string|boolean} onSuccessExec
 * @param {string} defaultFormName
 * @param {int} defaultTimeout
 * @returns {Boolean} - false
 */
function DC2GetInterface(url, target, onSuccessExec, defaultFormName = 'DC2Ajaxer', defaultTimeout = 600000) {

    let tgt = $('#' + target);
    if (target && !tgt.length) {
        console.error('Get Interface error: target missing: ' + target);
        return false;
    }

    if (typeof defaultFormName === 'undefined') {
        defaultFormName = 'DC2Ajaxer';
    }

    let SubmitData = new FormData($('#' + defaultFormName)[0]);
    // console.log(DefaultFormName, SubmitData);

    if (typeof defaultTimeout === 'undefined' || defaultTimeout < 600000) {
        defaultTimeout = 600000;
    }

    if (target && $('#DC2PleaseWaitBlock').length === 0) {
        tgt.html(DC2PleaseWaitText);
    }

    url = typeof url === 'undefined' || !url ? '/sys/rpc.php?cmd=ping' : url;

    $.ajax({
        type: "POST",
        url: url,
        data: SubmitData,
        cache: false,
        // dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server it is a query string request
        timeout: defaultTimeout,
        success: function (result, textStatus, jqXHR) {
            if (typeof result.error === 'undefined') {
                if (target) {
                    tgt.html(result);
                } else {
                    console.warn('no target!');
                }
                // console.log(url, target, typeof OnSuccessExec);
                if (typeof onSuccessExec === 'function') {
                    // console.log(target, typeof OnSuccessExec, {url:url, result:result});
                    onSuccessExec({url: url, result: result});
                } else if (typeof onSuccessExec === 'string' && typeof window[onSuccessExec] === 'function' ) {
                    window[onSuccessExec](result);
                } else {
                    if (!target) {
                        console.error('no callback defined!');
                    }
                }
            } else {
                // Handle errors here
                console.error('Get Interface error: ' + result.error);
                console.error(textStatus);
                console.error(url);
                console.error(result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            console.error('Get Interface error: ' + textStatus);
            console.error(url);
        }
    });
    return false;
}

var DC2GetInterfaceDialog = false;

/**
 *
 * @param {string} url RPC URL
 * @param {function|string|boolean} onSuccessExec function or expression
 * @param {string} defaultFormName
 * @param {int} defaultTimeout
 * @returns {*|jQuery}
 * @constructor
 */
async function DC2GetInterfaceJSON(url, onSuccessExec, defaultFormName = 'DC2Ajaxer', defaultTimeout = 600000) {

    if (typeof defaultFormName === 'undefined' || !defaultFormName) {
        defaultFormName = 'DC2Ajaxer';
    }

    let SubmitData = new FormData($('#' + defaultFormName)[0]);
    // console.log(SubmitData);

    if (typeof defaultTimeout === 'undefined' || !defaultTimeout || defaultTimeout < 600000) {
        defaultTimeout = 600000;
    }

    DC2_AJAX_Bisy = true;

    return $.ajax({
        type: "POST",
        url: typeof url === 'undefined' || !url ? '/sys/rpc.php?cmd=ping' : url,
        data: SubmitData,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server it is a query string request
        timeout: defaultTimeout,
        success: function (result, textStatus, jqXHR) {
            if (typeof result.error === 'undefined') {
                // console.log(result);
                DC2_AJAX_Results = result;

                if (DC2_AJAX_Results.status !== 'success') {

                    console.warn(url, DC2_AJAX_Results.status);

                    let dlgBody = $('<div>').html(DC2_AJAX_Results.message);
                    // DC2GetInterfaceDialog =
                    dlgBody.dialog({
                            modal: true,
                            closeOnEscape: true,
                            draggable: true,
                            classes: {
                                "ui-dialog": "dc2alert-" + DC2_AJAX_Results.status
                            },
                            //        height: Math.min(600, getWindowHeight()),
                            width: Math.min(800, .9 * getWindowWidth()),
                            // height: Math.min(600, .9 * getWindowHeight()),
                            title: DC2_AJAX_Results.status,
                            buttons: [
                                {
                                    text: "Закрыть",
                                    click: function () {
                                        // DC2GetInterfaceDialog.dialog("close");
                                        dlgBody.dialog('destroy').remove();
                                    },
                                    'class': 'dc2input'
                                }
                            ],
                            close: function () {
                                dlgBody.dialog('destroy').remove();
                            }
                        }
                    );
                    DC2_AJAX_Bisy = false;
                    return false;
                }

                if (typeof onSuccessExec === 'function') {
                    onSuccessExec(result);
                } else if (typeof onSuccessExec === 'string' && typeof window[onSuccessExec] === 'function' ) {
                    window[onSuccessExec](result);
                } else {
                    console.error('not a function', onSuccessExec);
                }
                DC2_AJAX_Bisy = false;
                return true;
            } else {
                // Handle errors here
                console.error('Get Interface JSON error: ' + result.error);
                console.error(textStatus);
                console.error(url);
                console.error(result);
            }
            DC2_AJAX_Bisy = false;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            console.error('Get Interface JSON error: ');
            console.error(url);
            console.error(textStatus);
            DC2_AJAX_Bisy = false;
        }
    });
}


/**
 *
 * @param {string} id
 * @param {string} datetime
 * @param {function|false} callback
 * @param {int} numberOfMonths
 * @param {string} dateFormat
 */
function DC2_InitCalendar(id, datetime, callback, numberOfMonths=1, dateFormat='Y-m-d') {
    let calendar = $('#' + id);
    if (calendar.length === 0) {
        console.error('calendar missing: ' + id);
    }
    if (typeof numberOfMonths === 'undefined') {
        numberOfMonths = 1;
    }

    let dateFormatShort = 'Y-m-d';
    if (typeof dateFormat === 'undefined') {
        if (datetime) {
            dateFormat = 'Y-m-d H:i';
        } else {
            dateFormat = 'Y-m-d';
        }
    }

    let now = new Date();

    if (datetime) {
        $.datetimepicker.setLocale('ru');
        calendar.datetimepicker({
            onClose: function (ct, $i) {
                if (typeof callback === 'function') {
                    callback(ct, $i);
                }
                // $i.datetimepicker('destroy');
            },
            onGenerate: function (ct, $i) {
                // $i.datetimepicker('show');
                // setTimeout(function(){ $i.datetimepicker('show'); }, 10);
            },
            format: dateFormat,
            formatTime: 'H:i',
            formatDate: dateFormatShort,
            timepicker: true,
            yearStart: now.getFullYear() - 100,
            yearEnd: now.getFullYear() + 50,
            step: 5,
            weeks: true,
            dayOfWeekStart: 1,
            numberOfMonths: numberOfMonths,
            showApplyButton: false,
            scrollMonth: false,
            scrollTime: false,
            scrollInput: false
        });
    } else {
        $.datetimepicker.setLocale('ru');
        calendar.datetimepicker({
            onClose: function (ct, $i) {
                if (typeof callback === 'function') {
                    callback(ct, $i);
                }
                // $i.datetimepicker('destroy');
            },
            onGenerate: function (ct, $i) {
                // $i.show();
                //setTimeout(function(){ $i.datetimepicker('show'); }, 10);
            },
            format: dateFormat,
            // formatTime:'H:i',
            timepicker: false,
            formatDate: dateFormat,
            yearStart: now.getFullYear() - 100,
            yearEnd: now.getFullYear() + 50,
            step: 5,
            weeks: true,
            dayOfWeekStart: 1,
            numberOfMonths: numberOfMonths,
            showApplyButton: false,
            scrollMonth: false,
            scrollTime: false,
            scrollInput: false
        });
    }
}


function DC2VideoActivate(id, target, url) {
    let video = $('#' + target);
    if (!video.length) {
        return;
    }
    video.attr('src', url.replace('autoplay=0', 'autoplay=1'));
    $('a[id^="VideoPlay_"]').removeClass('video_active');
    $('a[id="VideoPlay_' + id + '"]').addClass('video_active');
    $(document).scrollTop(video.offset().top);
}


function DC2scrollTo(el, Delta, Frame, speed) {
    if (typeof Delta === 'undefined') {
        Delta = 0;
    }
    if (typeof Frame !== 'undefined' && (!Frame || Frame === '')) {
        Frame = undefined;
    }
    if (typeof speed === 'undefined') {
        speed = 500;
    }
    if ( $(el).length ) {
        if (typeof Frame === 'undefined' || $(Frame).length === 0) {
            $("html, body").animate({scrollTop: $(el).offset().top + Delta}, speed, 'linear');
        } else {
            $(Frame).animate({scrollTop: $(el).offset().top + Delta}, speed, 'linear');
        }
    }
}


function DC2Scroll2URLAnchor(delta) {
    if (typeof delta === 'undefined') {
        delta = 0;
    }
    let anchorName = window.location.hash.substring(1);
    if (!anchorName) {
        return;
    }
    DC2scrollTo('#' + anchorName, delta);
}


function DC2_BlobProcessor(id, property, cmd, confirmDelete) {
    let formID;
    let prop = $('#' + property + '_upload');

    if (prop.closest("form")) {
        formID = prop.closest("form").attr('id');
    } else {
        formID = 'DC2Ajaxer';
    }

    if (cmd === 'DoUpload') {
        DC2GetInterface(
            '/sys/rpc.php?cmd=DoUpload&id=' + id + '&Property=' + property + '&cbf=DC2_BlobProcessor',
            property + '_upload',
            false,
            formID
        );
    } else if (cmd === 'DoDelete') {
        if (confirm(confirmDelete || 'Удалить этот файл?')) {
            DC2GetInterface(
                '/sys/rpc.php?cmd=DoDelete&id=' + id + '&Property=' + property + '&cbf=DC2_BlobProcessor',
                property + '_upload',
                false,
                formID
            );
        }
    }
}


function getScrollBarWidth() {
    let $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
        widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
    $outer.remove();
    return 100 - widthWithScroll;
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#"
        + (r.length === 1 ? '0' : '') + r
        + (g.length === 1 ? '0' : '') + g
        + (b.length === 1 ? '0' : '') + b;
}


function strip_tags(input, allowed) { // eslint-disable-line camelcase
    //  discuss at: http://locutus.io/php/strip_tags/
    // original by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Luke Godfrey
    // improved by: Kevin van Zonneveld (http://kvz.io)
    //    input by: Pul
    //    input by: Alex
    //    input by: Marc Palau
    //    input by: Brett Zamir (http://brett-zamir.me)
    //    input by: Bobby Drake
    //    input by: Evertjan Garretsen
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Eric Nagel
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Tomasz Wesolowski
    //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
    //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
    //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
    //   returns 2: '<p>Kevin van Zonneveld</p>'
    //   example 3: strip_tags("<a href='http://kvz.io'>Kevin van Zonneveld</a>", "<a>")
    //   returns 3: "<a href='http://kvz.io'>Kevin van Zonneveld</a>"
    //   example 4: strip_tags('1 < 5 5 > 1')
    //   returns 4: '1 < 5 5 > 1'
    //   example 5: strip_tags('1 <br/> 1')
    //   returns 5: '1  1'
    //   example 6: strip_tags('1 <br/> 1', '<br>')
    //   returns 6: '1 <br/> 1'
    //   example 7: strip_tags('1 <br/> 1', '<br><br/>')
    //   returns 7: '1 <br/> 1'
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    let commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

// Gallery functions
var DC2Sortable = [];
var DC2GalleryWaitState = false;

/**
 *
 * @param {int|string} pid
 * @returns {undefined}
 */
function DC2AddGalleryDialog(pid) {
    DC2GetInterfaceJSON('/sys/modules/gallery/gallery-rpc.php?cmd=AddGalleryDialog&pid=' + pid, function () {

        let CreateGalleryDialog = $('<form id="DC2GalleryForm" method="post" action="">' +
            '<div>' + DC2_AJAX_Results.message + '</div>' +
            '</form>').dialog({
            modal: true,
            show: 'fade',
            hide: 'drop',
            closeOnEscape: true,
            draggable: true,
            width: Math.min(1200, 0.7 * getWindowWidth()),
            title: 'Создание новой галереи',
            buttons: [
                {
                    text: "Сохранить",
                    click: function () { // event
                        DC2GalleryImagesCmd(pid, 'CreateGallery', function () {

                            $('<div title="Галерея создана">' + DC2_AJAX_Results.message + '</div>').dialog({
                                modal: true,
                                buttons: {
                                    Ok: function () {
                                        CreateGalleryDialog.dialog('destroy').remove();
                                        DC2GalleryWaitState = false;
                                        // window.location.reload();
                                        DC2EditGalleryDialog(DC2_AJAX_Results.records);
                                        $(this).dialog("close");
                                    }
                                }
                            });
                        });
                    },
                    'class': 'dc2input'
                },
                {
                    text: "Закрыть",
                    click: function () { // event
                        $(this).dialog('destroy').remove();
                    },
                    'class': 'dc2input'
                }
            ],
            open: function () { // event, ui
            },
            close: function () { // event, ui
                $(this).dialog('destroy').remove();
            }
        });
    });
}

/**
 *
 * @param id
 * @param callback
 * @constructor
 */
function DC2DeleteGalleryDialog(id, callback) {

    if (!confirm(DC2_GALLERY_EraseGalleryAreYouShure)) {
        return;
    }

    let args = '&subcmd=DeleteGallery&id=' + id;

    DC2GetInterfaceJSON('/sys/modules/gallery/gallery-rpc.php?cmd=EditGalleryCmd&' + args, function () {
        $('<div title="Галерея удалена">' + DC2_AJAX_Results.message + '</div>').dialog({
            modal: true,
            buttons: {
                Ok: function () {
                    if (typeof callback === 'function') {
                        callback();
                    }
                    window.location.reload();
                }
            }
        });
    });
}


function DC2SwitchSwitch(id, className, onVal, offVal) {
    if (typeof onVal === 'undefined') {
        onVal = 1;
    }
    if (typeof offVal === 'undefined') {
        offVal = '';
    }
    let el = $('#' + id);
    let sw = $('#switch' + id);
    if ( el.val() === onVal) {
        sw.addClass('dc2switchoff');
        sw.removeClass(className);
        el.val(offVal);
    } else {
        sw.addClass(className);
        sw.removeClass('dc2switchoff');
        el.val(onVal);
    }
}


/**
 *
 * @param {string} el
 * @returns {undefined}
 */
function DC2SwitchSortable(el) {
    if (typeof DC2Sortable[el] === 'undefined' || DC2Sortable[el] === 'disable') {
        if (typeof DC2Sortable[el] === 'undefined') {
            $(el).sortable();
        }
        $(el).sortable("enable");
        DC2Sortable[el] = 'enable';
    } else {
        $(el).sortable("disable");
        DC2Sortable[el] = 'disable';
    }
}

/**
 *
 * @param id
 * @returns {{t: string, ids: string, n: number}}
 * @constructor
 */
function DC2GalleryGetSelectedImages(id) {
    let t = '';
    let ids = '';
    let n = 0;

    $('#DC2GallerySortable' + id).find('img[class="Selected"]').each(function (i) {
        t += (10 + 10 * i) + ':' + $(this).attr('data') + ';';
        ids += (ids !== '' ? ', ' : '') + $(this).attr('data');
        n++;
    });
    return {'n': n, 't': t, 'ids': ids};
}

/**
 *
 * @param id
 * @param cmd
 * @param callback
 * @return void
 */
function DC2GalleryImagesCmd(id, cmd, callback) {
    let t = '';

    if (DC2GalleryWaitState) {
        return;
    }
    DC2GalleryWaitState = true;

    let selected = DC2GalleryGetSelectedImages(id);

    t = selected.t;

    if (t === '' && (cmd === 'Delete' || cmd === 'Rotate-90' || cmd === 'Rotate90')) {
        DC2GalleryWaitState = false;
        return;
    }

    if (cmd === 'Delete' && !confirm(DC2_GALLERY_EraseGalleryImageAreYouShure)) {
        DC2GalleryWaitState = false;
        return;
    }

    if (cmd === 'Reorder') {
        t += '&order=';
        $('#DC2GallerySortable' + id).find('img').each(function (i) {
            t += (10 + 10 * i) + ':' + $(this).attr('data') + ';';
        });
    }

    let args = '&subcmd=' + cmd + '&id=' + id + '&img=' + t;

    DC2GetInterfaceJSON('/sys/modules/gallery/gallery-rpc.php?cmd=EditGalleryCmd&' + args, function () {
        $('#DC2GalleryDebug').html(DC2_AJAX_Results.message);
        if (typeof callback === 'function') {
            callback();
        }
        DC2GetInterface('/sys/modules/gallery/gallery-rpc.php?cmd=EditGalleryCmd&subcmd=RefreshGallery&id=' + id,
            'DC2GalleryEditCanva' + id, function () {
                DC2GalleryCatchImagesList(id);
            }, 'DC2GalleryForm');

        DC2GalleryWaitState = false;
    }, cmd === 'UpdateImage' ? 'DC2GalleryImageForm' : 'DC2GalleryForm');

}


/**
 *
 * @param id
 * @param files
 * @return void
 */
function DC2GalleryFileUpload(id, files) {
    if (DC2GalleryWaitState) {
        return;
    }
    DC2GalleryWaitState = true;

    let args = '&subcmd=Upload&id=' + id;

    DC2GetInterface('/sys/modules/gallery/gallery-rpc.php?cmd=EditGalleryCmd&' + args, 'DC2GalleryDebug',
        function () {
            DC2GalleryDetachFileUpload('#gfiles');

            DC2GetInterface('/sys/modules/gallery/gallery-rpc.php?cmd=EditGalleryCmd&subcmd=RefreshGallery&id=' + id,
                'DC2GalleryEditCanva' + id, function () {
                    DC2GalleryCatchImagesList(id);
                }, 'DC2GalleryForm');

            DC2GalleryWaitState = false;
        }, 'DC2GalleryForm'
    );
}

/**
 *
 * @param {string} id
 * @returns {void}
 */
function DC2GalleryDetachFileUpload(id) {
    $(id).val('').trigger("change");
}

/**
 *
 * @param {string} id
 * @param {event} e
 * @returns {void}
 */
function DC2GalleryHandleFileUpload(id, e) {
    if ($(id).val() !== '') {
        let list = '';
        $.each(e.target.files, function (i, file) {
            list += file.name + ' (' + Math.floor(file.size / 1024) + 'Kb); ';
        });
        $(id + 'DC2GalleryLabelText').html('Ваши файлы для загрузки на сервер: ' + list);
        $(id + 'Detach').css({display: 'inline'});
        $(id + 'Upload').css({display: 'inline'});
        $(id + 'Title').css({display: ''});
        $(id + 'Description').css({display: ''});
    } else {
        $(id + 'DC2GalleryLabelText').html('кликните здесь, чтобы выбрать файлы или просто перетащите файлы в это поле');
        $(id + 'Detach').css({display: 'none'});
        $(id + 'Upload').css({display: 'none'});
        $(id + 'Title').css({display: 'none'});
        $(id + 'Description').css({display: 'none'});
    }
}

/**
 *
 * @param {string} id
 * @returns {void}
 */
function DC2GalleryCatchFileUpload(id) {
    $(id).on(
        'change',
        function (e) {
            DC2GalleryHandleFileUpload(id, e);
        }
    );
}

/**
 *
 * @param {string} id
 * @returns {void}
 */
function DC2GalleryCatchImagesList(id) {
    let gallery = $('#DC2GallerySortable' + id);
    gallery.sortable({
        forcePlaceholderSize: true,
        cursor: "move",
        placeholder: "DC2SortablePlaceholder",
        update: function () { // event, ui
            DC2GalleryImagesCmd(id, 'Reorder', false);
        }
        // grid: [ 100, 100 ]
    });

    gallery.find('img').click(function (evt) {
        if (!evt.shiftKey) {
            $('#DC2GallerySortable' + id).find('img').each(function () {
                $(this).removeClass('Selected');
            });
            $(this).addClass('Selected');
        } else {
            if ($(this).hasClass('Selected')) {
                $(this).removeClass('Selected');
            } else {
                $(this).addClass('Selected');
            }
        }
    });

    gallery.find('img').dblclick(function () {
        let imageid = $(this).attr('data');
        DC2GetInterfaceJSON('/sys/modules/gallery/gallery-rpc.php?cmd=EditImageDialog&imageid=' + imageid, function () {
            let list = DC2GalleryGetSelectedImages(id);

            let GalleryImageDialog = $('<form id="DC2GalleryImageForm" method="post" action="">' +
                '<div>' + DC2_AJAX_Results.message + '</div>' +
                '</form>').dialog({
                modal: true,
                show: 'fade',
                hide: 'drop',
                closeOnEscape: true,
                draggable: true,
                width: Math.min(1200, 0.7 * getWindowWidth()),
                title: list.n === 1 ? 'Описания изображения # ' + imageid : 'Описание изображений ## ' + list.ids,
                buttons: [
                    {
                        text: "Сохранить",
                        click: function () {
                            DC2GalleryImagesCmd(id, 'UpdateImage', function () {
                                GalleryImageDialog.dialog('destroy').remove();
                            });
                        },
                        'class': 'dc2input'
                    },
                    {
                        text: "Закрыть",
                        click: function () {
                            $(this).dialog('destroy').remove();
                        },
                        'class': 'dc2input'
                    }
                ],
                open: function (event, ui) {
                },
                close: function () { // event, ui
                    $(this).dialog('destroy').remove();
                }
            });
        });
    });
}


function DC2EditGalleryDialog(id) {
    DC2GetInterfaceJSON('/sys/modules/gallery/gallery-rpc.php?cmd=EditGalleryDialog&id=' + id, function () {
        let GalleryDialog = $('<form id="DC2GalleryForm" method="post" enctype="multipart/form-data" action="">' +
            '<div>' + DC2_AJAX_Results.message + '</div>' +
            '</form>').dialog({
            modal: true,
            show: 'fade',
            hide: 'drop',
            closeOnEscape: true,
            draggable: true,
            width: Math.min(1600, 0.9 * getWindowWidth()),
            title: 'Редактирование галереи',
            buttons: [
                {
                    text: "Сохранить",
                    click: function () {
                        DC2GalleryImagesCmd(id, 'Update', function () {
                            GalleryDialog.dialog('destroy').remove();
                            $('<div title="Галерея обновлена">' + DC2_AJAX_Results.message + '</div>').dialog({
                                modal: true,
                                buttons: {
                                    Ok: function () {
                                        window.location.reload();
                                    }
                                }
                            });
                        });
                    },
                    'class': 'dc2input'
                },
                {
                    text: "Закрыть",
                    click: function () {
                        $(this).dialog('destroy').remove();
                        window.location.reload();
                    },
                    'class': 'dc2input'
                }
            ],
            open: function () { // event, ui
                DC2GalleryCatchImagesList(id);
                DC2GalleryCatchFileUpload('#gfiles');

            },
            close: function () { // event, ui
                $(this).dialog('destroy').remove();
            }
        });
    });
}

function DC2BindLoad(selector, callback) {
    $(selector).each(function () {
        if ($(this).width() > 0 && $(this).height() > 0) { // why not?
            callback.apply(this);
        } else {
            $(this).one('load', function () {
                callback.apply(this);
            });
        }
    });
}

var DC2GallerLightSliderOptions = {};
var DC2GalleryLightboxOption = {};

function DC2GallerySwitch(pid, id) {
    DC2GetInterface('/sys/modules/gallery/gallery-rpc.php?' +
        'cmd=DisplayGallery' +
        '&pid=' + pid +
        '&id=' + id +
        '&options=' + encodeURIComponent(JSON.stringify(DC2GallerLightSliderOptions)), 'DC2GalleryCanva',
        function () { // t, el

            $('.DC2GalleryTitle').removeClass('active');
            $('#DC2GalleryTitle' + id).addClass('active');

            let imSearch = 'ul li a img';
            let galleryCanva = $('#DC2GalleryCanva');
            // let n = galleryCanva.find(imSearch).length;
            // if (n === 0) {
                // imSearch = 'ul li img';
                // n = galleryCanva.find(imSearch).length;
            // }

            // console.log(DC2GallerLightSliderOptions);

            if (typeof DC2GallerLightSliderOptions === 'undefined') {
                console.error('DC2GallerLightSliderOptions declaration is missing');
                DC2GallerLightSliderOptions = {};
            }

            let slider = $("#DC2GallerySlider" + id);
            DC2GallerLightSlider = slider.lightSlider(DC2GallerLightSliderOptions);

            if (typeof DC2GalleryLightboxOption === 'undefined') {
                console.error('DC2GalleryLightboxOption declaration is missing');
                DC2GalleryLightboxOption = {};
            }
            if (typeof lightbox === 'undefined') {
                console.error('lightbox plugin is missing');
            } else {
                lightbox.option(DC2GalleryLightboxOption);
            }

            slider.removeClass('cS-hidden');
        }
    );
}

/**
 *
 * @param {string} cname
 * @returns {string}
 */
function getCookie(cname) {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

/**
 *
 * @param {string} cname
 * @param {string} cValue
 * @param {int} expireDays
 */
function setCookie(cname, cValue, expireDays) {
    let d = new Date();
    d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cValue + ";" + expires + ";path=/";
}


/**
 *
 * @returns {boolean}
 */
function isMobile() {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-\/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ \/])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substring(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

/**
 *
 * @returns {boolean}
 */
function isMobileOrTablet() {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-\/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ \/])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substring(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}


/**
 *
 * @param {string} id
 * @param {int} bit
 * @returns {number}
 */
function dc2switchBit(id, bit) {
    let f = $(id);

    if (f.length === 0) {
        return 0;
    }

    let mask = 1 << bit;
    f.val(parseInt(f.val()) ^ mask);
    return parseInt(f.val());
}

/**
 *
 * @param {string} id
 * @param {int} bit
 * @returns {number}
 */
function dc2setBit(id, bit) {
    let f = $(id);

    if (f.length === 0) {
        return 0;
    }
    let mask = 1 << bit;
    f.val(parseInt(f.val()) | mask);
    return parseInt(f.val());
}

/**
 *
 * @param {string} id
 * @param {int} bit
 * @returns {number}
 */
function dc2clearBit(id, bit) {
    let f = $(id);

    if (f.length === 0) {
        return 0;
    }

    let mask = 1 << bit;
    f.val(parseInt(f.val()) & ~mask);
    return parseInt(f.val());
}

/**
 *
 * @param {string} contID
 * @param {string} el1ID
 * @param {string} el2ID
 * @param {function|{}} opt
 * @constructor
 */
function DC2HResizer(contID, el1ID, el2ID, opt) {
    let cont = $('#' + contID);
    $('#' + el1ID).resizable({
        grid: [1, 1],
        // delay: 100,
        // ghost: true,
        containment: '#' + contID,
        distance: 5,
        minWidth: cont.width() / 7,
        maxWidth: cont.width() * 6 / 7,
        handles: "e",
        resize: function (event, ui) {
            let cw = $('#' + contID).width();
            let w1 = ui.size.width;

            let rw = (100 * (cw - w1) / cw) + '%';
            let lw = (100 * (w1) / cw) + '%';

            let el1 = $('#' + el1ID);
            el1.outerWidth(lw);
            el1.css({'flex-basis': lw});

            let el2 = $('#' + el2ID);
            el2.outerWidth(rw);
            el2.css({'flex-basis': rw});

        },
        stop: function (event, ui) {
            let cw = $('#' + contID).width();
            let w1 = ui.size.width;

            let rw = (100 * (cw - w1) / cw) + '%';
            let lw = (100 * (w1) / cw) + '%';

            if (typeof opt === 'function') {
                opt(lw, rw);
            } else if (typeof opt === 'object') {
                opt.forEach(function (cls) { // , ind
                    $('.' + cls).outerWidth(rw);
                });
            }
        }
    });
}


function initBurgerSwitch(argv = []) {
    let menu = argv['menu'] || 'SideMenu';

    let env = argv['envelope'] || ('.' + menu + 'BurgerEnvelope');
    let envBgr = argv['envBgr'] || '#ddd';
    let envPad = argv['envPadding'] || '.5em';

    let b = argv['burger'] || ('.' + menu + 'Burger');

    let bIW = argv['burgerW'] || '26px';
    let bIMa = argv['burgerMargin'] || '.5em';

    let bBgr = argv['burgerBgr'] || '#555';
    let bIH = argv['burgerH'] || '4px';
    let bIM = argv['burgerM'] || '5px 0';
    let bIR = argv['burgerBorderRadius'] || (parseInt(bIH) / 2) + 'px';

    let bIT = argv['burgerTransform'] || (parseInt(bIH) + parseInt(bIM)) + 'px';

    let autoHide = typeof argv['autoHide'] === "undefined" ? true : argv['autoHide'];

    let mobile = isMobileOrTablet() || (getWindowWidth() <= 1270);

    let body = $('body');

    if (mobile && autoHide) {
        $('.' + menu).attr('style', 'height:0;overflow:hidden;transition:all .5s ease;display:flex;'); //
    } else {
        $('.' + menu).show('fast');
    }


    // build burger css
    $('<style>'
        + env
        + '{background-color:' + envBgr + ';padding:' + envPad + ';' + (mobile && autoHide ? 'display:block;' : '') + '}'

        + b
        + '{width:' + bIW + ';margin:' + bIMa + '; cursor:pointer;}'

        + b + ':before,'
        + b + ':after,'
        + b + ' div'
        + '{background-color:' + bBgr + ';height:' + bIH + ';margin:' + bIM + ';border-radius:' + bIR + ';content:\'\';display:block;transition:all .2s ease-in-out;}'

        + b + '-active:before'
        + '{transform: translateY(' + bIT + ') rotate(135deg);}'

        + b + '-active:after'
        + '{transform: translateY(-' + bIT + ') rotate(-135deg);}'

        + b + '-active div'
        + '{transform: scale(0);}'

        + '</style>').appendTo("head");


    if (mobile) {
        $('<div class="' + menu + 'BurgerEnvelope"><div class="' + menu + 'Burger"><div>&nbsp;</div></div></div>').insertBefore('#' + menu);
    }

    /*
    if (isMobile()) {
        // $(env).show('fast');
        // build burger
    } else {
        // $(env).hide('fast');
        // build burger
        $('<div class="'+menu+'BurgerEnvelope" style="display:none;"><div class="'+menu+'Burger"><div>&nbsp;</div></div></div>').insertBefore('#' + menu);
    }
     */

    $(b).on('click', function (e) {
        e.preventDefault();
        if ($(b).hasClass(menu + 'Burger-active')) {
            $(b).removeClass(menu + 'Burger-active');
            $('.' + menu).attr('style', 'height:0;overflow:hidden;transition:all .5s ease;display:block;');
            body.css({overflow: 'auto'});
        } else {
            $(b).addClass(menu + 'Burger-active');
            DC2scrollTo('.' + menu + 'BurgerEnvelope')
            $('.' + menu).attr('style', 'height:80vh;overflow-y:auto;transition:all .5s ease;display:block;');
            body.css({overflow: 'hidden'});
        }
        return false;
    });
}


let dc2KeywordsError = '';
let dc2DictionaryS2 = [];

/**
 *
 * @param options
 * @returns {boolean}
 */
async function dc2DumpOptions(options = {}){
    console.log('dc2DumpOptions', options);
    return false;
}

/**
 *
 * @param options
 */
async function dc2Select2Callback(options = {}){
    let chkList = [];
    $(options.fieldID).select2('data').forEach(function (el, i) {
        chkList[i] = {
            id: el.id,
            text: el.text,
            isNew: !!el.isNew,
            selected: el.selected
        };
    });

    let request = {
        id: options.oid,
        pid: options.opid,
        cmd: 'check',
        dictionary: options.dictionary,
        tags: chkList
    };

    let requestJSON = JSON.stringify(request);

    $('input[name="DC2AjaxerExtraz"]').val(requestJSON);

    return DC2GetInterfaceJSON(options.ajax.url+'?cmd=updateTag', function (r) {
    });
}

async function dc2VerifySelect2(){
    if( dc2DictionaryS2.length ){
        for (let i=0; i<dc2DictionaryS2.length; i++){
            let r = await dc2DictionaryS2[i].callback(dc2DictionaryS2[i].options);
            if( r.message !== '' ){
                DC2scrollTo(dc2DictionaryS2[i].options.fieldID);
                $(dc2DictionaryS2[i].options.fieldID).next().addClass('DC2Required');
                $(dc2DictionaryS2[i].options.fieldID).select2('open');
                $(dc2DictionaryS2[i].options.fieldID).parent().next().find('#dc2s2_p__Keywords_ErrorGeneral').html(r.message);
                return false;
            }else{
                $(dc2DictionaryS2[i].options.fieldID).next().removeClass('DC2Required');
                $(dc2DictionaryS2[i].options.fieldID).parent().next().find('#dc2s2_p__Keywords_ErrorGeneral').html('');
            }
        }
    }
    return true;
}

function dc2Select2KeywordsColorizer(data, container) {
    if ( data.isSystem === 1 && data.color !== undefined ) { // && data.hasOwnProperty('isSystem') && data.isSystem
        return $('<span class="dc2keyword"><span class="dc2keywordColor" style="background-color: ' + data.color + '"></span><span class="dc2keywordText">' + data.text + '</span></span>');
    } else if( data.element ) {
        if ($(data.element).attr("style") !== undefined) { // && data.hasOwnProperty('isSystem') && data.isSystem
            return $('<span class="dc2keyword"><span class="dc2keywordColor" style="background-color: ' + $(data.element).attr("style") + '"></span><span class="dc2keywordText">' + data.text + '</span></span>');
        } else {
            return data.text;
        }
    } else {
        return data.text;
    }
}
function dc2Select2Init(id, options = {}){
    let select = $(id);
    if( !select.length ){
        console.error('dc2Select2Init: selector ' + id + ' not found');
        return;
    }

    if( select.prop("tagName") !== 'SELECT' ){
        console.error('invalid select object tag: ', select.prop("tagName"));
        return;
    }


    const optDefs = {
        oid: "number", // object ID
        opid: "number", // parent object ID
        dictionary: 'string',
        tags: 'boolean',
        // 'minimumInputLength': 'number',
        multiple: 'boolean',
        placeholder: 'string',
        // 'callBack': 'function',
        templateResult: 'function',
        templateSelection: 'function',
        limit: 'number',
        // 'createTag': 'function',
        // 'dropdownParent': 'string',
        fieldID: 'string',
        dataFieldID: 'string',
        dataIsKey: 'boolean',
        dc2CheckCallBack: 'function'
    };

    let ajaxDataParams = {};
    let ajaxDataURL = '';

    if( !options.hasOwnProperty('oid') ){
        let oid = $('o_id');
        if( oid.length ){
            options.oid = parseInt(oid.val());
        }else{
            options.oid = 0;
        }
    }else{
        options.oid = parseInt(options.oid);
    }
    if( !options.hasOwnProperty('opid') ){
        let opid = $('o_pid');
        if( opid.length ){
            options.opid = parseInt(opid.val());
        }
    }else{
        options.opid = parseInt(options.opid);
    }
    // init select2 AJAX options
    if( options.dictionary === '_Keywords'){
        if( !options.hasOwnProperty('templateResult') ){
            options.templateResult = dc2Select2KeywordsColorizer;
        }
        if( !options.hasOwnProperty('templateSelection') ){
            options.templateSelection = dc2Select2KeywordsColorizer;
        }
        ajaxDataURL = '/sys/modules/TAGs/TAGs-rpc.php';
        ajaxDataParams = {
            cmd: 'GetTAGs',
            oid: options.oid,
            opid: options.opid,
            type: 'public',
            order: 'text',
            limit: parseInt( options.limit || 20 ),
        };
    }else if( options.dictionary === '_crm'){
        ajaxDataURL = '/sys/modules/crm/crm-rpc.php';
        ajaxDataParams = {
            cmd: 'getTags',
            oid: options.oid,
            opid: options.opid,
            type: 'public',
            datasonly: true,
            simple: 1,
            order: 'text',
            limit: parseInt( options.limit || 20 ),
        };
    }else if( options.dictionary === '_Member'){
        ajaxDataURL = '/sys/modules/Datum/Datum-rpc.php';
        ajaxDataParams = {
            cmd: 'getMembers',
            oid: options.oid,
            opid: options.opid,
            type: 'public',
            datasonly: true,
            simple: 1,
            order: 'text',
            limit: parseInt( options.limit || 20 ),
        };
    }else if( options.dictionary === '_Person'){
        ajaxDataURL = '/sys/modules/Datum/Datum-rpc.php';
        ajaxDataParams = {
            cmd: 'getPersons',
            src: options.dictionary,
            oid: options.oid,
            opid: options.opid,
            type: 'public',
            datasonly: true,
            simple: 1,
            order: 'text',
            limit: parseInt( options.limit || 20 ),
        };
    }else{
        ajaxDataURL = '/sys/modules/Datum/Datum-rpc.php';
        ajaxDataParams = {
            cmd: 'getDictionary',
            src: options.dictionary,
            oid: options.oid,
            type: 'public',
            datasonly: true,
            simple: 1,
            order: 'text',
            limit: parseInt( options.limit || 20 ),
        };
    }

    let s2options = {
        language: 'ru',
        dropdownCssClass: 'dc2select2',
        selectionCssClass: 'dc2select2',
        width: '100%',
        minimumInputLength: 0,
        tokenSeparators: ['\n', ',', ';', '\t'],
        createTag: function (params) {
            let term = $.trim(params.term);
            term = term.replaceAll(/\s\s+/g, ' ');
            // term = term.replaceAll(/[^a-zA-Zа-яА-Я0-9 \.\-]/ig, '');
            term = term.replaceAll(/[^\w0-9\u0401\u0451\u0410-\u044f :«»_\-./]/g, '');
            let errAreaLetterCount = $(id + '_ErrorLength');
            errAreaLetterCount.html('');

            if( term.length < 2 || term.length > 48 ){
                errAreaLetterCount.html('Каждое ключевое слово должно быть от <b>2</b> до <b>48</b> символов!');
                // errAreaLetterCount.parent().addClass('DC2Required');
                return null;
            }else{
                // errAreaLetterCount.parent().removeClass('DC2Required');
            }

            if (term === '' ) {
                return null;
            }

            return {
                id: term,
                text: term,
                isNew: true // add additional parameters
            }
        },
        insertTag: function (data, tag) {
            // Insert the tag at the end of the results
            data.push(tag);
        },
        ajax: {
            url: ajaxDataURL,
            type: 'GET',
            dataType: 'json',
            delay: 250, // wait 250 milliseconds before triggering the request
            data: function (params) {
                // prepare ajax request parameters
                ajaxDataParams.q = params.term || '';
                ajaxDataParams.page = params.page || 1;
                return ajaxDataParams;
            },
            processResults: function (data) {
                // Transforms the top-level key of the response object from 'items' to 'results'
                let r = [];
                for(let i=0; i<data.length; i++){
                    let opt = {id: data[i].id || data[i].value, text: data[i].text};
                    // additional _Keywords element options
                    if( data[i].hasOwnProperty('color') ){
                        opt.color = data[i].color;
                    }
                    if( data[i].hasOwnProperty('isSystem') ){
                        opt.isSystem = parseInt(data[i].isSystem);
                    }
                    r.push(opt);
                }
                return { results: r, pagination: { more: data.length === parseInt( options.limit || 20 ) } };
            }
        }
    };

    // init select2 options
    for(let key in optDefs){
        if( typeof options[key] === optDefs[key] || optDefs[key] === typeof window[options[key]] ){
            switch( optDefs[key] ){
                case 'string':
                    if( key === 'dropdownParent' ){
                        s2options[key] = $(options[key]);
                    }else {
                        s2options[key] = options[key];
                    }
                    break;

                case 'boolean':
                    s2options[key] = options[key] === true || options[key] === 1 || options[key] === 'true';
                    break;

                case 'number':
                    s2options[key] = parseInt(options[key]);
                    break;

                case 'function':
                    if( typeof options[key] === 'function' ){
                        s2options[key] = options[key];
                    }else if( typeof window[options[key]] === 'function' ){
                        s2options[key] = window[options[key]];
                    }else{
                        console.error(key, options[key], 'is not a function');
                    }
                    break;

                default:
                    console.error('unknown option type:', key, options[key]);
            }
        }
    }

    if( s2options.dc2CheckCallBack && typeof s2options.dc2CheckCallBack === 'function' ){
        dc2DictionaryS2.push({callback:s2options.dc2CheckCallBack, options:s2options});
    }else{
        dc2DictionaryS2.push({callback:dc2Select2Callback, options:s2options});

    }

    s2options.fieldID = id;

    select.select2(s2options);

    /**
     *
     * @param cmd string
     * @param dictItem {id:string, text: string, isNew:boolean, selected: boolean}
     */
    function dc2CheckKeywords(cmd, dictItem) {
        let chkList = [];
        select.select2('data').forEach(function (el, i) {
            chkList[i] = {
                id: el.id,
                text: el.text,
                isNew: !!el.isNew,
                selected: el.selected
            };
        });

        // send request
        let request = {
            id: options.oid,
            pid: options.opid,
            cmd: cmd,
            dictionary: options.dictionary,
            item: {
                id: dictItem.id || '',
                text: dictItem.text || '',
                isNew: !!dictItem.isNew,
                selected: !!dictItem.selected
            },
            tags: chkList
        };
        let requestJSON = JSON.stringify(request);

        $('input[name="DC2AjaxerExtraz"]').val(requestJSON);

        DC2GetInterfaceJSON(ajaxDataURL + '?cmd=updateTag', function (r) {
            let message = r.message;
            let errArea = $(id + '_ErrorGeneral');
            errArea.html('');
            if (message !== '') { // kwData.length <3 || kwData.length>9
                // errArea.parent().addClass('DC2Required');
                dc2KeywordsError = message;
                errArea.html(message);
            } else {
                // errArea.parent().removeClass('DC2Required');
                dc2KeywordsError = '';
            }

            // update hidden field with comma separated values or ids
            let dataField = $('#'+s2options.dataFieldID);
            if( !dataField.length ){
                console.error('missing data field: ', s2options.dataFieldID);
            }else{
                dataField.val(chkList.map(function (kw) {
                    if( !!s2options.dataIsKey ){
                        return kw.id;
                    }else {
                        return kw.text;
                    }
                }).join(","));
            }
        });
    }

    // bind select2 select/unselect events
    select.on('select2:select', function (e) {
        dc2CheckKeywords('select',  e.params.data);
    });

    select.on('select2:unselect', function (e) {
        dc2CheckKeywords('unselect', e.params.data);
    });

}


function dc2PrintArea(printAreaSelector) {
    let pa = $('.dc2printArea');
    let bc = $('.body-container');
    let ddp = $('#DynacontDebugPannel');
    let ud = $('.ui-dialog');
    let uwo = $('.ui-widget-overlay');
    pa.remove();
    ddp.hide();
    bc.hide();
    ud.hide();
    uwo.hide();
    $('body').append('<div class="dc2printArea">' + $(printAreaSelector).html() + '</div>');
    window.print();
    uwo.show();
    pa.remove();
    ud.show();
    bc.show();
    ddp.show();
}



function dc2DisplayWaitBlock(hideIt){
    if( hideIt !== undefined ){
        $('#DC2PleaseWaitBlock').remove();
        $('body').css('overflow', '');
    }else{
        $('body').append(DC2PleaseWaitText).css('overflow', 'hidden');
        $('#DC2PleaseWaitBlock').css({top: $(window).scrollTop()+'px'});
    }
}

function dc2SetImageInfoBlockWidth(property) {
    let uploadBlk = $('#' + property + '_upload');
    let preview = $('#p_' + property + '_preview');
    let infoBlk = $('#p_' + property + '_info');

    let infoBlwWidth = (infoBlk.parent().outerWidth(false) - uploadBlk.outerWidth(true) - preview.outerWidth(true) - 20);

    if (infoBlwWidth > 300) {
        infoBlwWidth = infoBlwWidth + 'px';
    } else {
        infoBlwWidth = '100%';
    }
    infoBlk.css({width: infoBlwWidth});
    // TODO: update image _info block content !!!
}


function dc2EditorBlobProcessor(id, property, cmd, defImg=false) {
    if (cmd === 'DoUpload') {

        if( $('#p_'+property).val() === '' ){
            return;
        }

        if( typeof defImg === undefined || defImg === false){
            defImg = '/i/EFMSU-logo-blue.svg';
        }

        dc2DisplayWaitBlock();
        DC2GetInterface(
            '/sys/rpc.php?cmd=DoUpload&' + 'id=' + id + '&' + 'Property=' + property + '&cbf=dc2EditorBlobProcessor',
            property + '_upload',
            function () {
                dc2DisplayWaitBlock(true);
                let cropImage = $('#p_' + property + '_preview .dc2PreviewImage');
                if( cropImage.length ){
                    cropImage.rcrop('destroy');
                    let imSrc = '/sys/raw.php?o='+id+'&p='+property+'&_t='+Math.random();
                    cropImage.prop('src', imSrc);
                    let im = new Image();
                    im.onload = function(){
                        $('#p_' + property + '_info').html('');
                        dc2SetImageInfoBlockWidth(property);
                    }
                    im.src = imSrc;
                }
            },
            'DC2ObjectEditForm'
        );
    } else if (cmd === 'DoDelete') {
        w2confirm({
            title: 'Удаление присоединенного файла',
            msg: 'Это необратимое действие! Вы уверены?',
            btn_yes: {
                text: 'Да, удалить!', // text for yes button (or yes_text)
                class: 'dc2input',    // class for yes button (or yes_class)
            },
            btn_no: {
                text: 'Нет, не удалять',  // text for no button (or no_text)
                class: 'dc2input',    // class for no button (or no_class)
            },
        }).yes(function () {   // callBack for yes button (or yes_callBack)
            DC2GetInterface(
                '/sys/rpc.php?cmd=DoDelete&' + 'id=' + id + '&' + 'Property=' + property + '&cbf=dc2EditorBlobProcessor',
                property + '_upload',
                function () {
                    bindImageProcessing('p_' + property);
                    $('#p_' + property + '_preview .dc2PreviewImage').attr('src', '/i/EFMSU-logo-blue.svg'); // css('background-image', '');
                    $('#p_' + property + '_info').html(DC2recommendedImageSize); // 'Информация об изображении:' TODO: print defaults!!!
                    dc2SetImageInfoBlockWidth(property);
                },
                'DC2ObjectEditForm'
            );
        }).no(function () {
        });
    }
}


function bindImageProcessing(name, defImg=false) {
    let fileInput = $('#' + name);
    let props = $('#' + name + '_preview');
    let maxW = parseInt(props.data('width'));
    let maxH = parseInt(props.data('height'));
    let maxSZ = parseInt(props.data('weight'));
    let rqAsp = parseFloat(props.data('aspect'));

    if( typeof defImg === undefined || defImg === false){
        defImg = '/i/EFMSU-logo-blue.svg';
    }


    DC2recommendedImageSize = 'Рекомендуемый размер изображения не более <b>' + maxW + 'px</b> на <b>' + maxH + 'px</b>'
        +'<br/>Рекомендуемый объём файла не более <b>' + Math.round(maxSZ / 1024) + 'Kb</b>'
    // + '<br/><br/><span style="color:crimson;">Соотношение размеров сторон изображения, высота к ширине, должно быть в пределах ' + (rqAsp - rqAspDlt) + '..' + (rqAsp + rqAspDlt) + '</span>.';
    ;
    fileInput.on('change', function () {
        let _URL = window.URL || window.webkitURL;
        let file, img;
        let cropImage = $('#' + name + '_preview .dc2PreviewImage');

        file = this.files[0];
        cropImage.rcrop('destroy');
        $('#'+name+'_crop').val('');

        if (file === undefined) {
            cropImage.attr('src', defImg);  // .css('background-image', '');
            $('#' + name + '_info').html(DC2recommendedImageSize); // 'Информация об изображении:'  TODO: display defaults!
            return;
        }

        if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png' && file.type !== 'image/svg+xml') {
            w2alert('Можно загружать только изображения в формате JPG, PNG или SVG!').ok(function () {
                fileInput.val('');
            });
            return;
        }

        if (file) {
            img = new Image();
            dc2DisplayWaitBlock();
            let objectUrl = _URL.createObjectURL(file);
            img.onload = function () {
                let imW = parseInt(this.width);
                let imH = parseInt(this.height);
                let imSZ = parseInt(file.size);
                let msg = '';
                let errWH = false;
                let errSz = false;


                if (imW > maxW || imH > maxH) {
                    errWH = true;
                    msg += '<span style="color:#ff6700;">Размер изображения больше допустимых значений</span>.'
                        + '<br/>Изображение будет <b>автоматически уменьшено</b> во время загрузки.<br/><br/>';
                }
                // canvas размер
                let cW = imW;
                let cH = imH;
                // let dX = 0;
                // let dY = 0;
                let imZ = 1;

                if( imW <= maxW && imH <= maxH ){
                    imZ = Math.max(maxW/imW, maxH/imH);
                }else if( imW <= maxW && imH > maxH ){
                    imZ = maxW/imW;
                }else if( imW > maxW && imH <= maxH ){
                    imZ = maxH/imH;
                }else{
                    imZ = Math.max(maxW/imW, maxH/imH);
                }
                cW = imW * imZ;
                cH = imH * imZ;

                let cropW = cW;
                let cropH = cH;
                if( cW > maxW ){
                    cropW = cH / ( maxH/maxW );
                }
                if( cH > maxH ){
                    cropH = cW / ( maxW/maxH );
                }

                let cZ =  cW / imW;

                let canvas = $('#' + name + '_canvas');
                canvas.prop('height', cH  ); // * cZ
                canvas.prop('width', cW  ); // * cZ
                canvas = document.getElementById(name + '_canvas');
                let ctx = canvas.getContext("2d");

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, cW, cH); // cW * cZ, cH * cZ
                ctx.drawImage(img, 0, 0, imW, imH, 0, 0, cW, cH); // imW*cZ, imH*cZ

                if (imSZ > maxSZ) {
                    msg += '<span style="color:#ff6700;">Объём файла изображения больше допустимых значений</span>.'
                        + '<br/>Изображение будет <b>автоматически сжато</b> во время загрузки.';
                    errSz = true;
                }

                if (msg !== '') {
                    msg = '<br/><br/>' + msg;
                }

                let preview = $('#' + fileInput.data('name') + '_preview');
                canvas.toBlob(function (blob) {
                    let _url = URL.createObjectURL(blob);
                    preview.find('img.dc2PreviewImage').attr('src', _url )
                        .one('load', function () {
                            dc2DisplayWaitBlock(true);

                            cropImage.rcrop({
                                grid: true,
                                maxSize : [cropW , cropH],
                                minSize: [cropW * .5, cropH * .5],
                                preserveAspectRatio: true,
                                inputsPrefix: name,
                                full: true
                            });

                            cropImage.on('rcrop-changed rcrop-ready', function (){
                                let rcropData = cropImage.rcrop('getValues');
                                rcropData.w1 = cW;
                                rcropData.h1 = cH;
                                rcropData.zoom = cZ;
                                let cropData = JSON.stringify(rcropData);
                                let cropArg = $('#'+name+'_crop');

                                if( cropData !== cropArg.val() ){
                                    cropArg.val(cropData);
                                }
                            });

                            cropImage.on('rcrop-ready', function (){
                                URL.revokeObjectURL(_url);
                            });
                        });

                }, 'image/jpg', .7);

                _URL.revokeObjectURL(objectUrl);

                let cName = name.substr(2);
                let uploadBlk = $('#' + cName + '_upload');
                let infoBlk = $('#' + fileInput.data('name') + '_info');
                let infoBlwWidth = (infoBlk.parent().outerWidth(false) - uploadBlk.outerWidth(true) - preview.outerWidth(true) - 10);

                if (infoBlwWidth > 300) {
                    infoBlwWidth = infoBlwWidth + 'px';
                } else {
                    infoBlwWidth = '100%';
                }

                infoBlk.css({width: infoBlwWidth});
                infoBlk.html(
                    // 'Информация об изображении:'
                    // '<br/><br/>'
                    '<b>Название:</b> ' + file.name
                    + '<!-- <br/><b>Тип:</b> ' + file.type + ' -->'
                    + '<br/><b>Размер:</b> ' + this.width + ' на ' + this.height + ' px' // <br/>
                    + (errWH ? ', рекомендуется <b>' + maxW + '</b> на <b>' + maxH + '</b> px' : '')
                    + '<br/><b>Объём файла:</b> ' + Math.round(file.size / 1024) + ' Kb'
                    + (errSz ? ', рекомендуется не более: <b>' + Math.round(maxSZ / 1024) + '</b> Kb' : '')
                    + msg
                );
                cropImage = $('#' + name + '_preview .dc2PreviewImage');
            };
            img.src = objectUrl;

        }

    });
    fileInput.data('name', name);
    if( props.find('.dc2PreviewImage').attr('src') === 'none' || props.find('.dc2PreviewImage').attr('src') === defImg ){
        $('#'+name+'_info').html(DC2recommendedImageSize);
        let cName = name.substr(2);
        dc2SetImageInfoBlockWidth(cName);
    }
}


$(function () {
    let url = encodeURIComponent($(location).attr("href"));
    let title = encodeURIComponent(document.title);
    let ut = encodeURIComponent(document.title + ': ' + $(location).attr("href"));
    let uta = encodeURIComponent('<p><a href="' + $(location).attr("href") + '">' + document.title + '</a>:</p>');
    let d = document.head.querySelector('meta[name="description"]');
    if (d) {
        d = d.content;
    } else {
        d = '';
    }
    let dd = encodeURIComponent('<p>' + d + '</p>');
    $('.DC2_share_buttons').html(
        '<a class="DC2lnktrc" id="shareVK" href="https://vk.com/share.php?url=' + url + '" target="_blank" rel="noopener noreferrer" title="поделиться ВКонтакте">' +
        '<img src="/i/ico_VK.svg" alt="VK" width="42" height="42" title="поделиться ВКонтакте"></a>' +
        // '<a class="DC2lnktrc" id="shareFB" href="https://www.facebook.com/sharer.php?t=' + title + encodeURIComponent(':' + d) + '&u=' + url + '" target="_blank" rel="noopener noreferrer" title="поделиться в Facebook">' +
        // '<img src="/i/ico_FB.svg" alt="Facebook" width="42" height="42" title="поделиться в Facebook"></a>' +
        // '<a class="DC2lnktrc" id="shareTW" href="https://twitter.com/intent/tweet?text=' + title + '&url=' + url + '" target="_blank" rel="noopener noreferrer" title="поделиться в Twitter">' +
        // '<img src="/i/ico_Twitter.svg" alt="Twitter" width="42" height="42" title="поделиться в Twitter"></a>' +
        '<a class="DC2lnktrc" id="shareTG" href="https://t.me/share/url?url=' + url + '&text=' + title + '" target="_blank" rel="noopener noreferrer" title="поделиться в Telegram">' +
        '<img src="/i/ico_Telegram.svg" alt="Telegram" width="42" height="42" title="поделиться в Telegram"></a>' +
        '<a class="DC2lnktrc" id="shareWA" href="https://wa.me/?text=' + ut + '" target="_blank" rel="noopener noreferrer" title="поделиться в WhatsApp">' +
        '<img src="/i/ico_WhatsApp.svg" alt="WhatsApp" class="mobileonly" width="42" height="42" title="поделиться в WhatsApp"></a>' +
        '<a  class="DC2lnktrc" id="shareEMail" href="mailto:?subject=' + title + '&body=' + uta + dd + '" target="_blank" title="Отправить ссылку почтой" rel="noopener noreferrer">' +
        '<img src="/i/ico_mail.svg" alt="mail" width="42" height="42" title="отправить почтой"></a>' +
        ''
    );
    $('.DC2_share_buttons_cvain').html(
        '<a class="DC2lnktrc" id="shareVK" href="https://vk.com/share.php?url=' + url + '" target="_blank" rel="noopener noreferrer" title="поделиться ВКонтакте">' +
        '<img src="/i/ico_VK.svg" alt="VK" width="42" height="42" title="поделиться ВКонтакте"></a>' +
        // '<a class="DC2lnktrc" id="shareFB" href="https://www.facebook.com/sharer.php?t=' + title + encodeURIComponent(':' + d) + '&u=' + url + '" target="_blank" rel="noopener noreferrer" title="поделиться в Facebook">' +
        // '<img src="/i/ico_FB.svg" alt="Facebook" width="42" height="42" title="поделиться в Facebook"></a>' +
        // '<a class="DC2lnktrc" id="shareTW" href="https://twitter.com/intent/tweet?text=' + title + '&url=' + url + '" target="_blank" rel="noopener noreferrer" title="поделиться в Twitter">' +
        // '<img src="/i/ico_Twitter.svg" alt="Twitter" width="42" height="42" title="поделиться в Twitter"></a>' +
        '<a class="DC2lnktrc" id="shareTG" href="https://t.me/share/url?url=' + url + '&text=' + title + '" target="_blank" rel="noopener noreferrer" title="поделиться в Telegram">' +
        '<img src="/i/ico_Telegram.svg" alt="Telegram" width="42" height="42" title="поделиться в Telegram"></a>' +
        '<a class="DC2lnktrc" id="shareWA" href="https://wa.me/?text=' + ut + '" target="_blank" rel="noopener noreferrer" title="поделиться в WhatsApp">' +
        '<img src="/i/ico_WhatsApp.svg" alt="WhatsApp" class="mobileonly" width="42" height="42" title="поделиться в WhatsApp"></a>' +
        '<a  class="DC2lnktrc" id="shareEMail" href="mailto:?subject=' + title + '&body=' + uta + dd + '" target="_blank" title="Отправить ссылку почтой" rel="noopener noreferrer">' +
        '<img src="/i/ico_mail.svg" alt="mail" width="42" height="42" title="отправить почтой"></a>' +
        ''
    );
    $("a[target='_blank'], a.DC2lnktrc").on('click', function () {
        DC2GetInterface('/sys/rpc.php?cmd=lnktrc'
            + '&lnkhref=' + encodeURIComponent($(this).attr('href'))
            + '&lnkid=' + encodeURIComponent($(this).attr('id')),
            'DC2AjaxerNULL', false);
    });
    $("[data-toggle]").on('click', function () {
        $('#' + $(this).attr('data-toggle')).toggle('slow');
    });

    // auto opened FAQ lists
    $("input[type='checkbox'][class='dc2switch'][data-dc2active-from][data-dc2active-till]").each(function (ind, el) {
        let df = new Date($(el).attr('data-dc2active-from'));
        let dt = new Date($(el).attr('data-dc2active-till'));
        let dc = new Date();
        if (df.getTime() <= dc.getTime() && dc.getTime() <= dt.getTime()) {
            $(el).prop('checked', true);
        } else {
            $(el).prop('checked', false);
        }
    });

    // Prevent jQuery UI dialog from blocking focusin
    $(document).on('focusin', function (e) {
        if ($(e.target).closest(".mce-window, .moxman-window").length) {
            e.stopImmediatePropagation();
        }
    });

    // trap extra modules
    $('div[data-module][data-cmd][data-arg]').each(function () {
        let tgt = $(this);
        let mod = tgt.attr('data-module');
        let cmd = tgt.attr('data-cmd');
        let arg = tgt.attr('data-arg');
        DC2GetInterfaceJSON('/sys/modules/' + mod + '/' + mod + '-rpc.php?'
            + 'cmd=' + encodeURIComponent(cmd)
            + '&arg=' + encodeURIComponent(arg), function (r) {
                tgt.html(r.message);
            }
        );
    });

    let locationHash = $(location).attr('hash');

    try{
        if (locationHash.length > 3 && $(location).attr('hash').substring(1, 2) === '!') {
            // jump to hidden blocks
            let el = '#' + locationHash.substring(2);
            DC2scrollTo(el, -0.25 * getWindowHeight());
            $(el).find('input[type="checkbox"]').prop('checked', true);
        } else if( $(locationHash).length>0 && document.getElementById(locationHash.substring(1)) ){
            $(locationHash).parent().click();
            DC2scrollTo(locationHash, -200);
        }
    }catch (e) {
        console.error(e);
    }
});