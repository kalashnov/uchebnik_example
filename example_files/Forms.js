/* global DC2_FORMS_REQUIRED_FIELD, DC2_FORMS_PASSWORD_REQUIRED, DC2_FORMS_EMAIL_REQUIRED, DC2_FORMS_PHONE, DC2_FORMS_ONLY_DIGITS, DC2_FORMS_POSITIVE_NUMBER_REQUIRED, DC2PleaseWaitText */

var DC2_Form_Set_RowCounter = [];
var DC2_Form_Set_CurrentSetID = false;

var DC2_Form_Validator = [];
var DC2_Form_PostAttach = [];
var DC2_Form_Datas = [];
var DC2_Form = [];


/**
 * Create headers for table view of set of controls
 * @param {Object} Control  - set control
 * @returns {String} - XHTML table headers
 */
function Form_GenerateHeader(Control) {
    let tHeader = '<div class="clearfix tr DC2Forms_SetTitle_' + Control.id + '">';

    for (let i in Control.Controls) {
        let cstyle = Control.Controls[i].columnstyle ? 'style="' + Control.Controls[i].columnstyle + '"' : '';
        tHeader += '<div class="th td DC2Forms_' + Control.id + '_' + Control.Controls[i].id + '" ' + cstyle + '>' + Control.Controls[i].label;
        if ('required' in Control.Controls[i] && Control.Controls[i].required) {
            tHeader += '<span class="DC2_RequiredField">*</span>';
        }
        tHeader += '</div>';
    }
    tHeader += '<div class="th td DC2FormsControlsColumn"></div>';
    tHeader += '</div>';
    return tHeader;
}


/**
 * Create headers for table view of set of controls
 * @param {Object} Control  - set control
 * @returns {String} - XHTML table footer
 */
function Form_GenerateFooter(Control) {
    let tFooter = '<div class="clearfix tr">';

    tFooter += '<div class="th td DC2FormsAddRow">' +
            '<button id="' + Control.id + '_Add" title="Добавить новую запись" class="dc2input TextButtonPlus">&plus;</button>' +
            '</div>';
    DC2_Form_PostAttach[Control.id + '_Add'] = {
        type: 'AddRecord',
        control: Control
    };

    tFooter += '</div>';

    return tFooter;
}




/**
 * Generate data row for set of controls
 * @param {Object} Control  - set control
 * @param {Boolean} FirstOne  - is it a first record in the set
 * @returns {String} - XHTML
 */
function Form_GenerateDataRow(Control, FirstOne) {
    let tRow = '';

    DC2_Form_Set_CurrentSetID = Control.id;

    if (FirstOne) {

        let minRows = Control.min;
        while (minRows-- > 0) {
            if (typeof DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] === 'undefined') {
                DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] = 0;
            } else {
                DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]++;
            }

            // console.log(Control);

            // title
            tRow += '<div id="' + DC2_Form_Set_CurrentSetID + '_Set_RowTitle_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + '" class="clearfix tr title">' +
                    Control.sololabel + ' # ' + (DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + 1) +
                    '</div>';

            // data
            tRow += '<div class="clearfix tr" id="' + DC2_Form_Set_CurrentSetID + '_Set_Row_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + '">';
            for (let i in Control.Controls) {
                tRow += '<div class="td DC2Forms_' + Control.id + '_' + Control.Controls[i].id + '">' + Form_GenerateControl(Control.Controls[i], true) + '</div>';
            }
            // console.log(Control.min);
            // remove row button
            tRow += '<div class="th td DC2FormsRemoveRow">' +
                    '' +
                    '</div>';
            DC2_Form_PostAttach[DC2_Form_Set_CurrentSetID + '_Remove_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]] = {
                type: 'RemoveRecord',
                control: Control,
                rowID: DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]
            };
            
            tRow += ''+ // set row ID
                '<input type="hidden"'+
                        ' id="'+DC2_Form_Set_CurrentSetID+'_'+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'_id'+'"'+
                        ' name="'+DC2_Form_Set_CurrentSetID+'['+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'][id]'+'"'+
                        ' value="" />';
            tRow += ''+ // set row PID
                '<input type="hidden"'+
                        ' id="'+DC2_Form_Set_CurrentSetID+'_'+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'_pid'+'"'+
                        ' name="'+DC2_Form_Set_CurrentSetID+'['+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'][pid]'+'"'+
                        ' value="" />';
            
            tRow += '</div>';
        }
    } else {
        // console.log(Control.max);

        if (typeof DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] === 'undefined') {
            DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] = 0;
        }

        if (Control.max === '*' || Control.max > ($('#' + DC2_Form_Set_CurrentSetID + '_Set > div.tr ').length - $('#' + DC2_Form_Set_CurrentSetID + '_Set > div.tr.title ').length - 2)) {
            // set rows are unlimited or less than max allowed
            if (Control.max !== '*' && (Control.max - 1) <= ($('#' + DC2_Form_Set_CurrentSetID + '_Set > div.tr ').length - $('#' + DC2_Form_Set_CurrentSetID + '_Set > div.tr.title ').length - 2)) {
                $('.DC2FormsAddRow').parent().hide();
            }
            DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]++;
        } else {
            // too many set rows!!!
            // TODO: hide add button
            $('.DC2FormsAddRow').parent().hide();
            return '';
        }

        tRow += '<div id="' + DC2_Form_Set_CurrentSetID + '_Set_RowTitle_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + '" class="tr title">' + Control.sololabel + ' # ' + (DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + 1) + '</div>';

        tRow += '<div class="clearfix tr" id="' + DC2_Form_Set_CurrentSetID + '_Set_Row_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + '">';
        for (let i in Control.Controls) {
            tRow += '<div class="td DC2Forms_' + Control.id + '_' + Control.Controls[i].id + '">' + Form_GenerateControl(Control.Controls[i], true) + '</div>';
        }
        // console.log(Control.min);

        tRow += '<div class="th td DC2FormsRemoveRow">' +
                '<button id="' + DC2_Form_Set_CurrentSetID + '_Remove_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + '" title="Удалить эту запись" class="dc2input TextButtonMinus">&minus;</button>' +
                '</div>';
        DC2_Form_PostAttach[DC2_Form_Set_CurrentSetID + '_Remove_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]] = {
            type: 'RemoveRecord',
            control: Control,
            rowID: DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]
        };
        
        tRow += ''+ // set row ID
            '<input type="hidden"'+
                    ' id="'+DC2_Form_Set_CurrentSetID+'_'+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'_id'+'"'+
                    ' name="'+DC2_Form_Set_CurrentSetID+'['+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'][id]'+'"'+
                    ' value="" />';
        tRow += ''+ // set row PID
            '<input type="hidden"'+
                    ' id="'+DC2_Form_Set_CurrentSetID+'_'+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'_pid'+'"'+
                    ' name="'+DC2_Form_Set_CurrentSetID+'['+DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]+'][pid]'+'"'+
                    ' value="" />';
        
        tRow += '</div>';
    }
    return tRow;
}

function Form_SelectDependantOptions(src, dst) {
    $('#' + dst + ' option').hide();
    $('#' + dst).val('');
    // console.log('#'+dst+' option[value^="'+$('#'+src).val()+'"]');
    $('#' + dst + ' option[value^="' + $('#' + src).val() + '"]').show();
}


function Form_SelectWaitExtend(id, response) {
    let s = $('#' + id);

    // console.log(response);
    // console.log(s);
    // console.log(s.length);

    if (s.length === 0) {
        setTimeout(function () {
            Form_SelectWaitExtend(id, response);
        }, 1000);
    } else {
        $.each(response, function (i, item) {
            s.append($('<option>', {
                value: item['value'],
                text: item['text']
            }));
        });
    }
}

/**
 * 
 * @param {object} Control - control definition
 * @param {boolean} Tabbed - generate as table grid element (defaults: false)
 * @param {boolean} Envelope - generate envelope container (defaults: true)
 * @param {boolean} NoRowIndex - generate short row validator ID  (defaults: false)
 * @returns {String} HTML code for control formatted as table row
 */
function Form_GenerateControl(Control, Tabbed, Envelope, NoRowIndex) {

    if (typeof Tabbed === 'undefined') {
        Tabbed = false;
    }

    if (typeof Envelope === 'undefined') {
        Envelope = true;
    }

    if (typeof NoRowIndex === 'undefined') {
        NoRowIndex = false;
    }

    let id = Control.id;
    let cid;
    let cidVisual;
    let ValidatorID = '';
    let NameID;

    if (Tabbed) {
        ValidatorID = DC2_Form_Set_CurrentSetID + (NoRowIndex ? '' : '_' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]) + '_' + id;
        NameID = DC2_Form_Set_CurrentSetID + (NoRowIndex ? '' : '[' + DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] + ']') + '[' + id + ']';
    } else {
        ValidatorID = id;
        NameID = id;
    }
    cid = ' id="' + ValidatorID + '" name="' + NameID + '"';
    cidVisual = ' id="visual_' + ValidatorID + '" name="visual_' + NameID + '"';


    if (!DC2_Form_Validator.Focus) {
        DC2_Form_Validator.Focus = ValidatorID;
    }


    let rowClass = 'clearfix DC2FormsFieldSet';
    if ('condition' in Control && Control.condition) {
        // TODO: conditional initialization 
        rowClass += ' DC2FormsHidden';

        // setup conditional handler
        $('#' + Control.condition[0]).change({Control: Control}, function (evt) {
            let selectedValue = $(this).val();
            let cond = evt.data.Control.condition[1];
            let condVal = evt.data.Control.condition[2];
            let controlRow = $('#r' + Control.id);

            if (cond === 'eq' && selectedValue === condVal
                    || cond === 'neq' && selectedValue !== condVal
                    || cond === 'gt' && selectedValue > condVal
                    || cond === 'gte' && selectedValue >= condVal
                    || cond === 'lt' && selectedValue < condVal
                    || cond === 'lte' && selectedValue <= condVal
                    ) {
                controlRow.removeClass('DC2FormsHidden');
                controlRow.addClass('DC2FormsInline');
            } else {
                controlRow.removeClass('DC2FormsInline');
                controlRow.addClass('DC2FormsHidden');
            }
        });
    }

    if (Control.type === 'hidden') {
        rowClass += ' DC2FormsHidden';
    }

    let html = '';

    if (Tabbed) {
        html += '<div class="feildname">' + Control.label;
        if ('required' in Control && Control.required) {
            html += '<span class="DC2_RequiredField">*</span>';
        }
        html += '</div>';
    }

    if (!Tabbed && Envelope) {
        html += '<div id="r' + id + '" class="' + rowClass + '">'
                + '<div class="'
            + (Control.type !== 'label'? 'DC2FormsLabelColumn':'w100')
            +'">';
        if (Control.type !== 'checkbox') {
            html += Control.label;
            if ('required' in Control && Control.required) {
                html += '<span class="DC2_RequiredField">*</span>';
            }
        } else {
            html += '&nbsp;';
        }
        html += '</div>';

        if( Control.type !== 'label' ){
            html += '<div class="DC2FormsDataColumn">';
        }
    }

    if( typeof Control.renderbefore !== 'undefined' && Control.renderbefore !== ''  ){
        html += '<div class="DC2FormFieldHeader">'+Control.renderbefore+'</div>';
    }
    
    let extra = '';

    let extraz = ['style', 'class', 'title', 'placeholder', 'onblur', 'onfocus', 'onchange', 'maxlength'];

    if (Control.type === 'checkbox') {
        let onchangeX = '$(\'#' + id + '\').val(this.checked?1:0);'; // TODO: change id to Control.value
        if (typeof Control['onchange'] === 'undefined') {
            Control['onchange'] = onchangeX;
        } else {
            Control['onchange'] = onchangeX + Control['onchange'];
        }
    }

    // console.log(Control);

    for (let i in extraz) {
        if (extraz[i] in Control) {
            if (Control[extraz[i]]) {
                let defClass;
                if (extraz[i] === 'class') {
                    defClass = 'dc2input ';
                } else {
                    defClass = '';
                }
                extra += ' ' + extraz[i] + '="' + defClass + Control[extraz[i]] + '"';
            } else {
                if (extraz[i] === 'style' && Control.hasOwnProperty('display') && Control.display === 'calendar') {
                    // set default date width
                    extra += ' style="width:8.5em;"';
                    extra += ' maxlength="10"';
                } else if (extraz[i] === 'class') {
                    extra += ' class="dc2input"';
                }
            }
        }
    }

    // console.log(Control);
    // console.log(cid);
    // console.log(Control.type);
    // console.log(Control.display);
    switch (Control.type) {
        case 'text':
            let c = '<input' + cid + ' type="text" value="" ' + extra + '/>';
            if (Control.hasOwnProperty('display')) {

                switch (Control.display) {
                    case 'calendar':
                        DC2_Form_PostAttach[ValidatorID] = {
                            type: 'calendar',
                            control: Control
                        };
                        break;

                    case 'autofill':
                        DC2_Form_PostAttach[ValidatorID] = {
                            type: 'autofill',
                            control: Control
                        };
                        break;

                    case 'autocomplete':
                        let ExtraName2;
                        let Multiple;
                        // console.log(Control.autocomplete);
                        if (typeof Control.autocomplete !== 'undefined' && (typeof Control.autocomplete.max === 'undefined' || Control.autocomplete.max !== 1)) { // multi by default
                            ExtraName2 = '[]';
                            Multiple = 'multiple="multiple"';
                        } else {
                            ExtraName2 = '';
                            Multiple = '';
                        }
                        // ValidatorID = id + ExtraID;
                        //console.log(ValidatorID);
                        //console.log(cid);
                        //console.log(Control);
                        c = '<select id="' + ValidatorID + '" name="' + NameID + ExtraName2 + '" ' + Multiple + extra + '></select>'; // class="tokenize-sample"
                        DC2_Form_PostAttach[ValidatorID] = {
                            type: 'autocomplete',
                            control: Control
                        };
                        break;

                    case 'select':
                        let ac = Control.options;
                        let q = 'q';
                        let argv = [
                            'of=json',
                            'datasonly=true',
                            'simple=1',
                            'limit=0'
                        ];

                        for (let key in ac.args) {
                            if (key === '_canva') {
                                if ( $('#CanvaID').length === 0 ) {
                                    console.log('selector ' + Control.id + ': CanvaID not found');
                                } else {
                                    argv.push('CanvaID=' + $('#CanvaID').val());
                                }
                            } else if (key === '_query') {
                                q = ac.args[key];
                            } else {
                                argv.push(key + '=' + ac.args[key]);
                            }
                        }
                        if (typeof ac.url === 'undefined') {
                            ac.url = '/sys/modules/Datum/Datum-rpc.php';
                        }

                        c = '<select ' + cid + extra + '>';
                        c += '</select>';

                        $.ajax({
                            type: "GET",
                            url: ac.url + '?' + argv.join('&'),
                            // async: false,
                            dataType: "json"
                        }).done(
                                function (response) {
                                    // var s = $('#' + Control.id);
                                    Form_SelectWaitExtend(ValidatorID, response);
                                }
                        );

                        //console.log(extra);
                        /*
                         * 
                         var response = $.ajax({
                         type: "GET",
                         url: ac.url + '?' + argv.join('&'),
                         async: false,
                         dataType: "json"
                         }).responseJSON;
                         //console.log(extra);
                         c = '<select ' + cid + extra + '>';
                         for (var opt in response) {
                         c += '<option value="' + response[opt]['value'] + '">' + response[opt]['text'] + '</option>';
                         }
                         c += '</select>';
                         
                         */
                        break;

                    case 'hidden':
                        return '<input' + cid + ' type="hidden" value="" ' + extra + '/>';

                    default:
                        break;
                }
            }
            html += c;
            break;

        case 'textarea':  // TODO: WysiWyg editor integration...
            html += '<textarea' + cid + extra + '/></textarea>';
            break;

        case 'label':
            // do nothing label already displayed
            break;

        case 'enum':
            // console.log(Control.data);
            let options = '';
            let hasDisplayProp = Control.hasOwnProperty('display');

            if( hasDisplayProp && Control.display === 'radio' ){
                // console.log(Control);
                for (let i in Control.data) {
                    let opt = Control.data[i].split(':');
                    if( Control.dataLabels && typeof Control.dataLabels[i] !== 'undefined' && Control.dataLabels[i] !== '' ){
                        options += '<div><input type="radio" class="dc2inout" ' + extra + ' id="'+ValidatorID+i+'" name="'+NameID+'" value="' + Control.data[i] + '"/><label>' + Control.dataLabels[i] + '</label></div>';
                    }else if (opt.length > 1 ) {
                        options += '<div><input type="radio" class="dc2inout" ' + extra + ' id="'+ValidatorID+i+'" name="'+NameID+'" value="' + opt[0] + '"/><label>' + opt[1] + '</label></div>';
                    } else {
                        options += '<div><input type="radio" class="dc2inout" ' + extra + ' id="'+ValidatorID+i+'" name="'+NameID+'" value="' + Control.data[i] + '"/><label>' + Control.data[i] + '</label></div>';
                    }
                }
                html += options;
            } else{
                // defaults to  Control.display === 'select'
                // console.log(Control.data);
                for (let i in Control.data) {
                    let opt = Control.data[i].split(':');
                    // console.log(Control.dataLabels[i], Control.data[i], opt, opt.length);
                    if( Control.dataLabels && typeof Control.dataLabels[i] !== 'undefined' && Control.dataLabels[i] !== '' && Control.dataLabels[i] !== null){
                        options += '<option value="' + Control.data[i] + '">' + Control.dataLabels[i] + '</option>';
                        // console.log('1');
                    }else if (opt.length > 1 ) {
                        options += '<option value="' + opt[0] + '">' + opt[1] + '</option>';
                        // console.log('2');
                    } else {
                        options += '<option value="' + Control.data[i] + '">' + Control.data[i] + '</option>';
                        // console.log('3');
                    }
                }
                html += '<select' + cid + extra + '>' + options + '</select>';
            }
            break;

        case 'checkbox':
            html += '<input' + cidVisual + ' type="checkbox" ' + extra + '/>' +
                    '<input' + cid + ' type="hidden" value="" />'; // TODO: add value from Control.value
            html += '<label for="visual_' + ValidatorID + '"> ' + Control.label;
            if ('required' in Control && Control.required) {
                html += '<span class="DC2_RequiredField">*</span>';
            }
            html += '</label>';
            break;

        case 'file':
            html += '<input' + cid + ' type="file" ' + extra + '/>';
            break;

        case 'hidden':
            return '<input' + cid + ' type="hidden" value="" ' + extra + '/>';

        case 'set':
            // console.log(Control.Controls);
            if (Control.Controls.length === 1 && Control.Controls[0].autocomplete !== false) { // 
                // single autocomplete element
                DC2_Form_Set_CurrentSetID = Control.id;
                if (typeof DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] === 'undefined') {
                    DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID] = 0;
                } else {
                    DC2_Form_Set_RowCounter[DC2_Form_Set_CurrentSetID]++;
                }
                html += Form_GenerateControl(Control.Controls[0], true, false, true);
            } else {
                // multicolunm set
                html += '<div class="dc2grid tbl" id="' + id + '_Set">';
                html +=
                        Form_GenerateHeader(Control)
                        + Form_GenerateDataRow(Control, true)
                        + Form_GenerateFooter(Control);
                html += '</div>';
            }

            break;

        default:
            console.log('unknown control type: ' + Control.type);
            return '';
    }

    DC2_Form_Validator.Controls[ValidatorID] = [];
    if ('mask' in Control && Control.mask) {
        DC2_Form_Validator.Controls[ValidatorID].mask = Control.mask;
    }
    if ('required' in Control && Control.required) {
        DC2_Form_Validator.Controls[ValidatorID].required = Control.required;
    }

    if( typeof Control.renderafter !== 'undefined' && Control.renderafter !== '' ){
        html += '<div class="DC2FormFieldFooter">'+Control.renderafter+'</div>';
    }

    if (!Tabbed && Envelope) {
        if( Control.type !== 'label' ) {
            html += '</div>'; // close data cell
        }
        html += '</div>'; // close row
    }

    return html;
}

/**
 *  Append form controls to the table container 
 * @param {string} Container - container id with leading #
 * @param {array} Controls - controls definitions
 * @returns {true} - always ;)
 */
function Form_GenerateControls(Container, Controls) {
    // console.log(Controls);
    for (let i in Controls) {
        $(Container).append(Form_GenerateControl(Controls[i]));
    }
    return true;
}

/**
 * 
 * @param {type} Validator
 * @param {type} ControlID
 * @param {type} doFocus
 * @returns {Boolean}
 */
function Form_ValidateControl(Validator, ControlID, doFocus) {
    const focusDelta = -100;
    let fid = '#' + ControlID;
    let f = $(fid);
    // console.log('Validate #'+ControlID);
    // console.log(f);
    if (typeof f === 'undefined') {
        // console.log('missing field #' + ControlID);
        return true;
    }
    
    if( typeof doFocus === 'undefined' ){
        doFocus = true;
    }

    if( f.attr('type') === 'hidden'){
        fid = '#visual_' + ControlID;
    }

    // console.log(f);
    if (!jQuery.contains(document, f[0])) {
        // console.log('already detached #' + ControlID);
        return true;
    }


    if ($('#r' + ControlID).hasClass('DC2FormsHidden')) {
        // do not check hidden fields...
        return true;
    }

    // console.log('#' + ControlID);
    // console.log('validate #' + ControlID);
    // console.log(f.val());
    // console.log(Validator);

    $('.DC2Forms_ErrorBox').remove();
    if ('required' in Validator && Validator.required) {
        if (f.val() === '' || f.val() === null || f.val() === '0') {
            if (f.next().hasClass('Tokenize')) {
                f.next().find('input').addClass('DC2Forms_ErrorField');
                f.next().after('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_REQUIRED_FIELD + '</div>');
            } else {
                f.addClass('DC2Forms_ErrorField');
                f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_REQUIRED_FIELD + '</div>');
            }
            //$('div class="DC2Forms_ErrorBox"').fadeOut( 2000 );
            //console.log( $('#' + ControlID + ' :div :ul :li.TokenSearch :input') );
            //console.log(f.next().find('input'));
            if (doFocus) {
                DC2scrollTo(fid, focusDelta);
                if (f.next().hasClass('Tokenize')) {
                    f.next().find('input').focus();
                } else {
                    f.focus();
                }
            }
            return false;
        } else {
            f.removeClass('DC2Forms_ErrorField');
        }
    }

    if ('mask' in Validator) {
        switch (Validator.mask) {
            case '*':
            case 'p':
                // password 
                if ($.trim(f.val()) !== '' && f.val().search(new RegExp("^.{4,32}$", "g")) < 0) {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_PASSWORD_REQUIRED + '</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
                }
                break;
            case '@':
                // email
                if ($.trim(f.val()) !== '' && f.val().search(/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z_]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/g) < 0
                        // f.val().search(new RegExp("^[a-zA-Z0-9][a-zA-Z0-9\._\-]{0,70}@[a-zA-Z0-9_\-]{1,70}(\.[a-zA-Z0-9_\-]{2,32}){2,5}$", "g")) < 0
                        // f.val().search(new RegExp("^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$", "g")) < 0
                        ) {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_EMAIL_REQUIRED + '</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
                }
                break;
            case '#':
                // telephone number
                // TODO: more intelligent mask
                if ($.trim(f.val()) !== '' && f.val().search(/^([+]?\d{1,3})? ?(([ (\-])[\d ]{2,4}([ )\-]))? ?([\d \-]{7,15})((( |ext|ex|доб|д)\.?)? ?[\d\-]{2,5})?$/g) < 0) {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_PHONE + '</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
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
                if ($.trim(f.val()) !== '' && f.val().search(new RegExp("^[0-9]*$", "g")) < 0) {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_ONLY_DIGITS + '</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
                }
                break;
            case '!':
                // non empty
                if ($.trim(f.val()) === '') {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_REQUIRED_FIELD + '</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
                }
                break;
            case 'd':
                // date 
                if ($.trim(f.val()) !== '' && f.val().search(new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$", "g")) < 0) {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">Укажите дату в формате: ГГГГ-ММ-ДД</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
                }
                break;
            case '>0':
                // non empty and not null/zero
                if ($.trim(f.val()) !== '' && parseInt($.trim(f.val())) <= 0) {
                    f.addClass('DC2Forms_ErrorField');
                    f.parent().append('<div class="DC2Forms_ErrorBox">' + DC2_FORMS_POSITIVE_NUMBER_REQUIRED + '</div>');
                    if (doFocus) {
                        DC2scrollTo(fid, focusDelta);
                        f.focus();
                    }
                    return false;
                } else {
                    f.removeClass('DC2Forms_ErrorField');
                }
                break;
            default:
                if (Validator.mask !== '') {
                    let R = new RegExp(Validator.mask, 'g');
                    // console.log(R);
                    // console.log(ControlID);
                    if ($.trim(f.val()) !== '' && f.val().search(R) < 0) {
                        // console.log(R, f.val());
                        f.addClass('DC2Forms_ErrorField');
                        f.parent().append('<div class="DC2Forms_ErrorBox">' + f.attr('title') + '</div>');
                        if (doFocus) {
                            DC2scrollTo(fid, focusDelta);
                            f.focus();
                        }
                        return false;
                    }
                }
                break;
        }
    }
    return true;
}


/**
 * verify form
 * @param {Object} Validator  Validator['FormID'] - form ID Validator.controls - hash array of checked element
 * @returns {Boolean}
 */
function Form_Validate(Validator) {
    if (typeof Validator === 'undefined') {
        return true;
    }

    if (typeof Validator['FormID'] === 'undefined') {
        alert('Missing FormID');
        return false;
    }
    let FormID = Validator['FormID'];
    if (!document.getElementById(FormID)) {
        alert('Missing form with Id ' + FormID);
        return false;
    }
    // theForm = $('#'+FormID);
    if (typeof Validator.Controls === 'undefined') {
        alert('Missing form Controls validating list');
        return false;
    }

    for (let i in Validator.Controls) {
        if (!Form_ValidateControl(Validator.Controls[i], i, true)) {
            return false;
        }
    }
    return true;
}


function Form_DoPostAttach() {
    for (let id in DC2_Form_PostAttach) {
        if (typeof DC2_Form_PostAttach[id].processed === 'undefined') {
            DC2_Form_PostAttach[id].processed = false;
        }
        if (!DC2_Form_PostAttach[id].processed) {
            switch (DC2_Form_PostAttach[id].type) {
                case 'calendar':
                    DC2_InitCalendar(id, '', false);
                    /*
                    $('#' + id).datepicker({
                        changeMonth: true,
                        changeYear: true,
                        showWeek: true,
                        dateformat: 'yy-mm-dd',
                        yearRange: "c-100:c+100",
                        onClose: function (dateText, inst) {
                            Form_ValidateControl(DC2_Form_Validator.Controls[inst.id], inst.id, false); // TODO: focus on the next field
                        },
                        beforeShow: function (input, inst) {
                            inst.dpDiv.css({marginTop: -input.offsetHeight + 'px', marginLeft: input.offsetWidth + 'px'});
                            // $(this).position({my:'right top', at:'left top', of:'#'+id});
                        }
                    });
                    */
                    break;

                case 'AddRecord':
                    $('#' + id).on('click', DC2_Form_PostAttach[id], function (evt) {
                        evt.stopPropagation(); // Stop stuff happening
                        evt.preventDefault();

                        // console.log(id, 'Add ' + evt.data.control.id);
                        // console.log(evt);
                        $('#' + evt.data.control.id + '_Set').find('div.tr:last').before(Form_GenerateDataRow(evt.data.control, false));
                        Form_DoPostAttach();
                        $('#' + evt.data.control.id + '_Set > div.title').each(function (index, element) {
                            // console.log(index, element);
                            $(element).html(evt.data.control.sololabel + ' # ' + (index + 1));
                        });
                        // console.log(DC2_Form_Validator);
                        return false;
                    });
                    break;

                case 'RemoveRecord':
                    $('#' + id).on('click', DC2_Form_PostAttach[id], function (evt) {
                        evt.stopPropagation(); // Stop stuff happening
                        evt.preventDefault();
                        // console.log('Remove');
                        // console.log(evt) ;

                        $('#' + evt.data.control.id + '_Set_RowTitle_' + evt.data.rowID).remove();
                        $('#' + evt.data.control.id + '_Set_Row_' + evt.data.rowID).remove();
                        $('.DC2FormsAddRow').parent().show();

                        // TODO: remove validators!!!
                        $('#' + evt.data.control.id + '_Set > div.title').each(function (index, element) {
                            // console.log(index, element);
                            $(element).html(evt.data.control.sololabel + ' # ' + (index + 1));
                        });

                    });
                    break;

                case 'autofill':
                    break;

                case 'autocomplete':
                    // console.log(id);

                    var ac = DC2_Form_PostAttach[id].control.autocomplete;
                    var acLength = DC2_Form_PostAttach[id].control.autocompleteLength ?? 0;
                    var q = 'q';
                    var argv = ['datasonly=true'];
                    for (var key in ac.args) {
                        if (key === '_query') {
                            q = ac.args[key];
                        } else {
                            argv.push(key + '=' + ac.args[key]);
                        }
                    }
                    if (typeof ac.url === 'undefined') {
                        ac.url = '/sys/modules/Datum/Datum-rpc.php';
                    }
                    var token = {
                        datas: ac.url + '?' + argv.join('&'),
                        searchMinLength: acLength,
                        searchParam: q,
                        autosize: true,
                        placeholder: typeof DC2_Form_PostAttach[id].control.placeholder === 'undefined' ? DC2_Form_PostAttach[id].control.label : DC2_Form_PostAttach[id].control.placeholder,
                        debounce: 10,
                        sortable: true,
                        newElements: typeof ac.allownew === 'undefined' ? false : ac.allownew,
                        maxElements: (typeof ac.max === 'undefined' || ac.max === '0') ? 0 : ac.max
                    };
                    // console.log(token);
                    $('select#' + id).tokenize(token);


                    break;
            }
            DC2_Form_PostAttach[id].processed = true;
        }
    }
}


function Form_InitFormDataWaitSelect(index, value){
    if( ! $('#'+index+' option').length ){
        setTimeout(function(){
            Form_InitFormDataWaitSelect(index, value);
        }, 1000);
    }else{
        // console.log(index, $('#'+index), value, $('#'+index).val());
        $('#'+index).val(value).trigger('change');
        // console.log(index, $('#'+index).val());
    }
}

function Form_InitFormData(data) {
    if (! data.data ) {
        return;
    }
    
    // fill data if defined...
    $.each(data.data, function (index, value) {
        var ftype = $('#'+index).attr('type');
        
        // console.log("data: ", index , " = " , value , " type:" , ftype);

        if( ftype === 'file' ){
            return;
        }
        if( value instanceof Array ){
            // TODO: subset init
            return;
        }
        if( $('#'+index).is('select')){
            Form_InitFormDataWaitSelect(index, value);
        }else if( $('#'+index).is(':hidden') && $('#visual_'+index).is(':checkbox') ){
            // console.log(index+' is checkbox and it is '+ (value ? 'checked' : 'non checked'));
            $('#visual_'+index).prop('checked', !!value).trigger('change');
        }else{
            $('#'+index).val(value).trigger('change');
            // console.log("data updated: "+index + " = " + value + " type:"+ftype);
        }
    });
    
    
    for(let i in data.Controls){
        // console.log(data.Controls[i].id, data.Controls[i].type, data.Controls[i].display);
        switch(data.Controls[i].type){
            case 'set':
                if( DC2_Form.data[data.Controls[i].id] instanceof Array ){
                    // console.log(data.Controls[i].id, DC2_Form.data[data.Controls[i].id], DC2_Form.data[data.Controls[i].id].length);
                    while( DC2_Form.data[data.Controls[i].id].length-1 > DC2_Form_Set_RowCounter[data.Controls[i].id] ){
                        $('#'+data.Controls[i].id+'_Add').trigger( "click" );
                    }
                    for(var r in DC2_Form.data[data.Controls[i].id] ){
                        for(var f in DC2_Form.data[data.Controls[i].id][r] ){
                            
                            // if( f==='id' || f==='pid' ){
                            //    continue;
                            // }
                            var index = data.Controls[i].id+'_'+r+'_'+f;
                            
                            if( $('#'+index).is('select')){
                                Form_InitFormDataWaitSelect(index, DC2_Form.data[data.Controls[i].id][r][f]);
                            }else{
                                $('#'+data.Controls[i].id+'_'+r+'_'+f).val(DC2_Form.data[data.Controls[i].id][r][f]).trigger('change');
                            }
                        }
                    }
                }
                break;
        }
    }
    
}

/**
 * 
 * @type Boolean - true if Form is in debug mode, no actual submit/save, defaults - false
 */
var DC2_Form_DebugMode = false;
var DC2_Form_DoubleClickPreventer = false;

/**
 * 
 * @param {type} data
 * @returns {Boolean}
 */
function Form_InitForm(data) {
    var html = '';

    // console.log(data);
    if (typeof data.canva === 'undefined') {
        data.canva = 'DC2Arena';
    }
    if (typeof data.resultscanva === 'undefined') {
        data.resultscanva = 'DC2Arena';
    }

    data.reloadonsubmit = !(typeof data.reloadonsubmit === 'undefined' || data.reloadonsubmit !== 'true');
    // console.log(data.reloadonsubmit);

    var doRecaptcha = data.recaptcha === 'enforce';

    if (typeof data.url === 'undefined') {
        data.url = "/sys/modules/Forms/Forms-rpc.php?cmd=Submit";
    }

    DC2_Form = data;
    
    if (typeof data.data !== 'undefined') {
        DC2_Form_Datas = data.data;
    }

    DC2_Form_Validator.FormID = data.dialogID + 'Form';

    DC2_Form_Validator.Controls = [];
    DC2_Form_Validator.Focus = false;
    if (data.Status.id) {
        // alert(data.Status.text);
        $('#' + data.canva).html(data.Status.text);
        $( '#' + data.canva ).dialog({modal:true,width:'90%',show:{effect:'fadeIn',duration: 1000}});
        // console.log(data.Status.id + ': ' + data.Status.text);
        return false;
    }

    $('#' + data.canva).html('');
    var dstyle = '';
    if ('dialogStyle' in data) {
        dstyle = data.dialogStyle;
    }
    var dclass = 'DC2FormsDialogTable';
    if ('dialogClass' in data) {
        dclass = data.dialogClass;
    }
    //  enctype="multipart/form-data" method="post" action="'+data.url+'"

    html = '<form id="' + data.dialogID + 'Form" class="DC2_Form" enctype="multipart/form-data" method="post" action="' + data.url + '">' +
            '<div id="' + data.dialogID + 'Table" style="' + dstyle + '" class="' + dclass + '">' +
            '<h2>' + data.label + '</h2>' +
            '</div></form>';
    $('#' + data.canva).append(html);
    $('#' + data.canva).show();


    // generate controls
    // console.log(data);
    for (var i in data.Controls) {
        // alert(data.Controls[i].label);
        if (data.Controls[i].type === 'include') {
            Form_GenerateControls('#' + data.dialogID + 'Table', data.Controls[i].Controls);
        } else {
            $('#' + data.dialogID + 'Table').append(Form_GenerateControl(data.Controls[i]));
        }
    }

    $.datepicker.regional['ru'] = {
        autoSize: true,
        closeText: 'Закрыть',
        prevText: 'Предыдущий месяц',
        nextText: 'Следующий месяц',
        currentText: 'Сегодня',
        monthNames: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
        monthNamesShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        dayNamesShort: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        dayNamesMin: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        weekHeader: '',
        constrainInput: true,
        dateFormat: 'yy-mm-dd',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        selectOtherMonths: false,
        showOtherMonths: true,
        showAnim: 'slideDown',
        showButtonPanel: true,
        gotoCurrent: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['ru']);

    Form_DoPostAttach();

    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="CollectionID" id="CollectionID" value="' + $.trim(data.CollectionID) + '"/>');
    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="FormID" id="FormID" value="' + $.trim(data.FormID) + '"/>');
    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="id" id="id" value="' + (typeof data.id !== 'undefined' ? $.trim(data.id) : 0) + '"/>');
    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="pid" id="pid" value="' + (typeof data.pid !== 'undefined' ? $.trim(data.pid) : 0) + '"/>');
    
    if( typeof data.hash !== 'undefined'){
        $('#' + data.dialogID + 'Table').append('<input type="hidden" name="hash" id="hash" value="' + $.trim(data.hash) + '"/>');
    }

    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="KeyAuthCollection" id="KeyAuthCollection" value="' + (typeof data.pidCollectionID !== 'undefined' ? $.trim(data.pidCollectionID) : '') + '"/>');
    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="KeyAuthForm" id="KeyAuthForm" value="' + (typeof data.pidFormID !== 'undefined' ? $.trim(data.pidFormID) : '') + '"/>');

    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="Key" id="Key" value="' + (typeof data.pKey !== 'undefined' ? $.trim(data.pKey) : 0) + '"/>');


    $('#' + data.dialogID + 'Table').append('<input type="hidden" name="referer" id="referer" value="' + (typeof data.referer !== 'undefined' ? $.trim(data.referer) : 0) + '"/>');

    if (DC2_Form_DebugMode) {
        $('#' + data.dialogID + 'Table').append('<input type="hidden" name="debug" id="debug" value="1"/>');
    }

    // attach validators
    // console.log('attach validators...');
    // console.log(DC2_Form_Validator);

    for (var control in DC2_Form_Validator.Controls) {
        // console.log('add blur validator for ' + control);
        $('#' + control).blur({Validator: DC2_Form_Validator.Controls[control]},
                function (evt) {
                    // console.log('got focusout on ' + evt.target.id);
                    Form_ValidateControl(evt.data.Validator, evt.target.id, false);
                });
    }

    if( doRecaptcha ) {
        html = '<script src="https://www.google.com/recaptcha/api.js" async defer></script>';
    }else{
        html = '';
    }

    // generate and attach action buttons
    html += '<div class="DC2FormsSubmitControls">';
    if (typeof data.Buttons === 'undefined' || !data.Buttons) {
        if( doRecaptcha ) {
            html += '<div class="g-recaptcha" data-sitekey="' + data.siteKey + '"></div>';
        }

        html += '<input id="' + data.canva + 'FormSubmit" type="submit" class="dc2input" value="' + DC2_FORMS_SUBMIT + '" />' ;
        html += '<input type="reset" class="dc2input" value="'+DC2_FORMS_CLEAR+'" />';
    } else {
        // TODO: Append button controls!!!
    }
    html += '</div>';

    if( doRecaptcha ){
        // console.log('reCaptcha');
        html += '';
    }

    $('#' + data.dialogID + 'Table').append(html);

    data.codeEvaluated = false;

    // focus in the rendered dialog...
    if( DC2_Form_Validator.Focus && data.autofocus ){
        $('#' + DC2_Form_Validator.Focus).focus();
    }


    // attach submit event
    // console.log('#' + data.dialogID + 'Form');
    $('#' + data.dialogID + 'Form').on('submit', function (event) {

        if (DC2_Form_DoubleClickPreventer) {
            return;
        }
        DC2_Form_DoubleClickPreventer = true;
        $('#' + data.canva + 'FormSubmit input').prop('disabled', true);
        // $('#'+data.canva+'FormSubmit').prop( 'disabled', true );

        event.stopPropagation(); // Stop stuff happening
        event.preventDefault();

        // console.log(DC2_Form_Validator);

        if (Form_Validate(DC2_Form_Validator)) {

            if ($.trim(data.Code) && !data.codeEvaluated && typeof window[data.FormID + 'Verify'] === 'undefined') {
                // console.log($.trim(data.Code));
                data.codeEvaluated = true;
                window.eval($.trim(data.Code));
            }
            // console.log('Looking for: '+data.FormID+'Verify');
            var fnValidator = window[data.FormID + 'Verify'];

            // console.log('Try to use validator: ' + fnValidator);

            if (typeof fnValidator === "function") {
                // safe to use the function
                if (!fnValidator(data)) {
                    console.log(data.FormID + 'Verify' + ': submit validation error');
                    // $('#'+data.canva+'FormSubmit').prop( 'disabled', false );
                    DC2_Form_DoubleClickPreventer = false;
                    $('#' + data.canva + 'FormSubmit input').prop('disabled', false);
                    return;
                }
            }
            /*
            else {
                console.log(fnValidator + ': is not a function');
            }
             */

            var SubmitData = new FormData($(this)[0]);

            // console.log('submit validation OK');
            // console.log(data);
            // console.log(SubmitData);
            $('#' + data.canva).html(DC2PleaseWaitText);
            DC2scrollTo('#' + data.canva, -64);

            $.ajax({
                type: "POST",
                url: data.url,
                data: SubmitData,
                cache: false,
                // dataType: 'json',
                processData: false, // Don't process the files
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                success: function (result, textStatus, jqXHR)
                {
                    // console.log('s' + data.dialogID);
                    // console.log('s' + data.url);
                    // console.log('s' + data.resultscanva);
                    if (typeof result.error === 'undefined')
                    {
                        // console.log([result, textStatus, data]);
                        if( $('#' + data.resultscanva).length ){
                            $('#' + data.resultscanva).html(result)
                        }else{
                            $('#' + data.canva).html(result);
                        }
                        // console.log(data.DialogMode);
                        if (typeof data.DialogMode !== 'undefined' && data.DialogMode) {
                            setTimeout('$("#' + data.canva + '").dialog("close")', 3000);
                        }
                    } else
                    {
                        // Handle errors here
                        console.log('ERRORS 1: ' + result.error);
                        console.log(data);
                    }
                    // $('#'+data.canva+'FormSubmit').prop( 'disabled', false );
                    if (data.reloadonsubmit) {
                        window.location.reload();
                    }
                    /*
                     else{
                     DC2_Form_DoubleClickPreventer = false;
                     $('#' + data.canva + 'FormSubmit input').prop('disabled', false);
                     }
                     */
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    // Handle errors here
                    console.log('ERRORS 2: ' + textStatus);
                    console.log(data);
                    DC2_Form_DoubleClickPreventer = false;
                    $('#' + data.canva + 'FormSubmit input').prop('disabled', false);
                }
            });
        } else {
            console.log('submit validation error');
            // $('#'+data.canva+'FormSubmit').prop( 'disabled', false );
            DC2_Form_DoubleClickPreventer = false;
            $('#' + data.canva + 'FormSubmit input').prop('disabled', false);
        }

    });
    
    

    Form_InitFormData(data);
    
}


function Form_InitFormDialog(data) {
    $('#' + data.canva).css({'display': 'none'});
    data.DialogMode = true;
    Form_InitForm(data);
    $('#' + data.canva + ' h2').empty();
    $('#' + data.canva).dialog({
        modal: true,
        closeOnEscape: true,
        draggable: true,
        title: data.label,
        resizable: true,
        maxWidth: getWindowWidth() * 0.9,
        width: Math.min(1400, getWindowWidth() * 0.9)
    });

    /*
     buttons: {
     Ok: function () {
     $(this).dialog('save');
     $(this).dialog('close');
     }
     }
     
     */
}


function Form_GetFormDefinition(Collection, Form, id, DialogMode, cbf, canva, resultscanva) {
    if (typeof DialogMode === 'undefined') {
        DialogMode = false;
    }

    // alert( $(Collection).val() + '/' + $(Form).val() );
    if( typeof id==='undefined'){
        id = getParameter(window.location, 'id');
    }
    var hash = '';
    if( id === '' ){
        hash = getParameter(window.location, 'hash').split(':');
        id = hash[0];
        hash = hash[1];
    }
    $.getJSON('/sys/modules/Forms/Forms-rpc.php?cmd=GetJSONDeclaration' +
            '&CollectionID=' + Collection +
            '&FormID=' + Form +
            '&id=' + id+
            '&hash='+ hash,
            function(data){
                if( typeof canva !== 'undefined' && $('#'+canva) !== null ){
                    data.canva = canva;
                    data.resultscanva = canva;
                }
                if( typeof resultscanva !== 'undefined' && $('#'+resultscanva).length ){
                    data.resultscanva = resultscanva;
                }

                if( typeof DialogMode!=='undefined' && DialogMode ){
                    Form_InitFormDialog(data);
                }else{
                    Form_InitForm(data);
                }
                if( typeof cbf === "function"  ){
                    cbf();
                }
            }
    );
    return false;
}



function Form_LoadForm(Collection, Form, id) {
    Form_GetFormDefinition(Collection, Form, id, true);
}


function Form_KeyAuthForm(CanvaID, aCollectionID, aFormID, wCanvaID, wCollectionID, wFormID, url) {
    if (typeof url === 'undefined') {
        url = '/sys/modules/Forms/Forms-rpc.php?cmd=CheckAuthByKey';
    }
    var html = '<form id="' + CanvaID + 'Form" class="DC2_Form" enctype="multipart/form-data" method="post" action="' + url + '">' +
            '<div id="' + CanvaID + 'Table">' +
            '</div></form>';

    $('#' + CanvaID).append(html);
    $('#' + CanvaID + 'Table').append('<input type="text" name="Key" id="Key" placeholder="Укажите ключ, полученный при регистрации" title="Укажите ключ, полученный при регистрации" class="dc2input" style="width:80%"/>&nbsp;');
    $('#' + CanvaID + 'Table').append('<input type="hidden" name="aCollectionID" id="aCollectionID" value="' + aCollectionID + '"/>');
    $('#' + CanvaID + 'Table').append('<input type="hidden" name="aFormID" id="aFormID" value="' + aFormID + '"/>');
    $('#' + CanvaID + 'Table').append('<input type="hidden" name="wCollectionID" id="wCollectionID" value="' + wCollectionID + '"/>');
    $('#' + CanvaID + 'Table').append('<input type="hidden" name="wFormID" id="wFormID" value="' + wFormID + '"/>');
    $('#' + CanvaID + 'Table').append('<input type="submit" class="dc2input" value="Вход" onclick="return Form_KeyAuthFormSubmit(\'' + CanvaID + '\', \'' + wCanvaID + '\');"/>');

}

function Form_KeyAuthFormSubmit(CanvaID, wCanvaID) {
    var url = $('#' + CanvaID + 'Form').attr('action') +
            '&CanvaID=' + CanvaID +
            // '&aCollectionID=' + $('#aCollectionID').val() +
            // '&aFormID=' + $('#aFormID').val() +
            // '&wCollectionID=' + $('#wCollectionID').val() +
            // '&wFormID=' + $('#wFormID').val() +
            // '&Key=' + $('#Key').val() +
            '';
    // console.log('Form_KeyAuthFormSubmit: '+url);
    
    var wCollectionID = $('#wCollectionID').val();
    var wFormID = $('#wFormID').val();

    var Key = $.trim($('#Key').val());

    DC2GetInterface(url, CanvaID, function () {

        if (Key !== $.trim($('#KeyID').val()) + ':' + $.trim($('#KeyAuth').val())) {
            console.log('Invalid key: ' + Key);
            return;
        }


        var url;

        url = '/sys/modules/Forms/Forms-rpc.php?cmd=GetJSONDeclaration' +
                '&CollectionID=' + wCollectionID +
                '&FormID=' + wFormID +
                '&pid=' + $('#KeyID').val() +
                '&pidCollectionID=' + $('#KeyAuthCollection').val() +
                '&pidFormID=' + $('#KeyAuthForm').val() +
                '&pKey=' + $('#KeyAuth').val() +
                '';

        // console.log(['Load', url, wCanvaID, wCollectionID, wFormID]);

        $.getJSON(url, function (data) {
            data.canva = wCanvaID;
            data.resultscanva = wCanvaID;
            data.pid = $('#KeyID').val();
            data.pKey = $('#KeyAuth').val();
            data.pidCollectionID = $('#KeyAuthCollection').val();
            data.pidFormID = $('#KeyAuthForm').val();
            // console.log(data);
            Form_InitForm(data);
            DC2scrollTo('DC2LKCanva');
        });

    }, CanvaID + 'Form');
    return false;
}

////////////////////////////////////////////////////////////////////////////////
// TODO: rewrite this customization temporary code 
////////////////////////////////////////////////////////////////////////////////


function Form_AssignAccessCodes(CanvaID, Collection, Form, Attribute) {
    $.get('/sys/modules/Forms/Forms-rpc.php?cmd=AssignAccessCodes' +
            '&CanvaID=' + CanvaID +
            '&CollectionID=' + Collection +
            '&FormID=' + Form +
            '&AttributeID=' + Attribute +
            '', function (data) {
                alert(data);
                window.location.reload();
            });
    return false;
}


function Form_GetDataByKey(CanvaID, Collection, Form, CodeName, Canva) {
    var url = '/sys/modules/Forms/Forms-rpc.php?cmd=GetDataByKey' +
            '&CanvaID=' + CanvaID +
            '&CollectionID=' + Collection +
            '&FormID=' + Form +
            '&Key=' + CodeName +
            '&Val=' + $('#' + CodeName).val() +
            '';

    DC2GetInterface(url, Canva, false, 'DC2ClientForm');
    return false;
}



function Form_SubmitAgreement(CanvaID, Collection, Form, CodeName, Canva) {
    var url = '/sys/modules/Forms/Forms-rpc.php?cmd=SubmitAgreement' +
            // '&CanvaID=' + CanvaID +
            // '&CollectionID=' + Collection +
            // '&FormID=' + Form +
            // '&Key=' + CodeName +
            // '&Val=' + $('#'+CodeName).val() +
            '';

    DC2GetInterface(url, Canva, false, 'DC2ClientForm');
    return false;
}


function Form_InitEmbedForms(){
    $("div[data-dc2-Collection][data-dc2-Form]").each(function(ind,el){
        let targetID = '';
        console.log( $(el).attr('id') , $(el).attr('id') !== undefined );
        if( $(el).attr('id') !== undefined ){
            targetID =$(el).attr('id') ;
        }else{
            targetID = $(el).attr('data-dc2-Collection') + $(el).attr('data-dc2-Form') + '_' + ind;
            $(el).attr('id', targetID);
        }
        console.log('Inline form initialization started:', $(el).attr('data-dc2-Collection'), $(el).attr('data-dc2-Form'), 0, false, false, targetID );
        Form_GetFormDefinition( $(el).attr('data-dc2-Collection'), $(el).attr('data-dc2-Form'), 0, false, false, targetID);
    });
}

$(function() {
    /* Process auto forms... id="DC2Arena" data-dc2-collection="Registration" data-dc2-form="FeedbackPK" */
    Form_InitEmbedForms();
});