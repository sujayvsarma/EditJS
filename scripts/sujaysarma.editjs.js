/*
    This is the main script file for Sujay Sarma's Edit.js system.

    Edit.js lets developers not worry about having to use a view and a Create/Edit page. Instead, you can just build one page, 
    and using attributes and Edit.js, create powerful view & data entry pages with significantly lesser HTML and other code, 
    reducing your development and testing efforts. 

    Edit.js uses Bootstrap as well as Jquery to do its work. 

        - Last tested version of Bootstrap: 4.5.3
        - Last tested version of Jquery:    3.5.1 

    (c) Copyright 2021. Sujay V. Sarma. All Rights Reserved.
*/

/**
 * Base class for edit controls
 */
class HtmlEditControlBase {

    /**
     * Constructor
     * 
     * @param {HTMLElement} htmlElement - Reference to the actual Html element on the page. 
     */
    constructor(htmlElement) {
        if (htmlElement.length === 0) {
            throw 'HtmlEditControlBase.ctor(): htmlElement cannot be null or empty.';            
        }
        
        this._originalElement = htmlElement;
        this._originalAttributes = new Array();
        this._editAttributes = new Array();
        this._viewAttributes = new Array();
        this._commonHtmlAttributes = new Array();
        this._editorType = 'textbox';
        this._currentValue = null;

        // Calculate various IDs
        this._formElementId = htmlElement.id;
        this._controlBlockId = 'editjs_' + this._formElementId;
        this._viewControlId = 'editjs_view_' + this._formElementId;
        this._viewEditButtonId = 'editjs_view_editbutton_' + this._formElementId;
        this._editControlId = 'editjs_edit_input_' + this._formElementId;
        this._editUpdateButtonId = 'editjs_edit_updatebutton_' + this._formElementId;
        this._editCancelButtonId = 'editjs_edit_cancelbutton_' + this._formElementId;
        this._editClearValueButtonId = 'editjs_edit_clearbutton_' + this._formElementId;

        for(var a, i = 0, attributes = htmlElement.attributes, len = attributes.length; i < len; i++) {
            a = attributes[i];
            if ((a.value !== undefined) && (a.value !== false)) {
                if (a.name === 'value') {
                    this._currentValue = a.value;
                }
                else if (a.name === 'editor') {
                    this._editorType = a.value;
                }
                else {
                    if (a.name.startsWith('edit-')) {
                        this._editAttributes.push({ Name: a.name.substring(5).toLowerCase(), Value: a.value });    
                    }
                    else if (a.name.startsWith('view-')) {
                        this._viewAttributes.push({ Name: a.name.substring(5).toLowerCase(), Value: a.value });
                    }
                    else {
                        this._commonHtmlAttributes.push({ Name: a.name.toLowerCase(), Value: a.value });
                    }

                    // everything except special attributes gets pushed into this one
                    this._originalAttributes.push({ Name: a.name.toLowerCase(), Value: a.value });
                }                
            }
        }
    }

    /**
     * Attach the HTML attributes applicable
     * @param {String} elementHtml - String containing HTML for the element being rendered that needs the attributes applied. 
     * @param {String} mode - Control mode (one of: 'view' or 'edit') 
     * 
     * @returns The appended elementHtml
     */
    AttachApplicableAttributes(elementHtml, mode) {
        if ((mode === undefined) || (mode === '') || (mode === null)) {
            mode = 'view';
        }

        var classAttribute = '';
        for(var i = 0, name; i < this._viewAttributes; i++) {
            if (this._viewAttributes[i].Name === "class") 
            { 
                classAttribute += ' ' + this._viewAttributes[i].Value; 
                continue; 
            }
            
            elementHtml += ' ' + this._viewAttributes[i].Name + '="' + this._viewAttributes[i].Name.Value + '"';
        }
        
        for(var i = 0, name; i < this._commonHtmlAttributes; i++) {
            if (this._commonHtmlAttributes[i].Name === "class") 
            { 
                classAttribute += ' ' + this._commonHtmlAttributes[i].Value; 
                continue; 
            }
            
            elementHtml += ' ' + this._commonHtmlAttributes[i].Name + '="' + this._commonHtmlAttributes[i].Name.Value + '"';
        }

        if (classAttribute === '') {
            classAttribute = 'form-control';
        }

        if (mode === 'view') {
            if (classAttribute.indexOf('readonly') < 0) {
                classAttribute += ' readonly';
            }
            
            if (classAttribute.indexOf('disabled') < 0) {
                classAttribute += ' disabled';
            }
        }
        
        elementHtml += ' class="' + classAttribute + '"';
        return elementHtml;
    }


    /**
     * Checks for the existence of a unary attribute (eg: disabled, readonly, checked, etc)
     * @param {HTMLElement} element - The Html Element to check 
     * @param {String} attributeName - Name of the attribute
     * @returns TRUE if the attribute existed, FALSE if not
     */
    getUnaryAttribute(element, attributeName) {
        var attribute = element.getAttribute(attributeName);
        if ((attribute === undefined) || (attribute === null) || (attribute.value === false)) {
            return false;
        }

        return true;
    }


    /**
     * Gets the state of the element as a Json-object
     * @returns {JSON} - A Json object containing the value, properties and attributes of the control element.
     */
    GetState() {
        var activeElement = document.getElementById(_viewControlId) ?? document.getElementById(this._editControlId);
        if ((activeElement === null) || (activeElement === undefined)) {
            activeElement = new HTMLDivElement();
        
            var classAttribute = '';
            for(var i = 0, name; i < this._viewAttributes; i++) {
                if (this._viewAttributes[i].Name === "class") 
                { 
                    classAttribute += ' ' + this._viewAttributes[i].Value; 
                    continue; 
                }
                
                activeElement.setAttribute(this._viewAttributes[i].Name, this._viewAttributes[i].Name.Value);
            }
            
            for(var i = 0, name; i < this._commonHtmlAttributes; i++) {
                if (this._commonHtmlAttributes[i].Name === "class") 
                { 
                    classAttribute += ' ' + this._commonHtmlAttributes[i].Value; 
                    continue; 
                }
                
                activeElement.setAttribute(this._commonHtmlAttributes[i].Name, this._commonHtmlAttributes[i].Name.Value);
            }

            if (classAttribute === '') {
                classAttribute = 'form-control';
            }

            if (mode === 'view') {
                if (classAttribute.indexOf('readonly') < 0) {
                    classAttribute += ' readonly';
                }
                
                if (classAttribute.indexOf('disabled') < 0) {
                    classAttribute += ' disabled';
                }
            }
            
            activeElement.setAttribute('class', classAttribute);
        }

        var State = {
            Value: this._currentValue,
            Properties: {
                IsDisabled: this.getUnaryAttribute('disabled'),
                IsSelected: this.getUnaryAttribute('selected'),
                IsChecked:  this.getUnaryAttribute('checked'),
                IsActive:   this.getUnaryAttribute('active')
            },
            Attributes: {},
            Classes: []
        };

        var x = '';
        for(var i = 0, attr; i < activeElement.attributes.length; i++) {
            attr = activeElement.attributes[i];
            if (attr.name !== 'class') {
                if (x.length > 0) {
                    x += ',';
                }
                x += attr.name.toLowerCase() + ': "' + attr.value + '"';   
            }
            else {
                State.Classes.push(attr.value.toLowerCase());
            }
        }
        x = '{' + x + '}';
        State.Attributes = JSON.parse(x);

        return State;
    }


    /**
     * Set the value of an attribute. If attribute was not found, it will create it.
     * @param {Array} attributeArray - The corresponding attribute array to operate on 
     * @param {*} name - Name of the attribute to set
     * @param {*} value - Value to set
     */
    SetAttributeValue(attributeArray, name, value) {
        if (attributeArray !== null) {
            var found = false;
            for(var i = 0, attr; i < attributeArray.length; i++) {
                attr = attributeArray[i];
                if (attr.Name === name) {
                    attr.value = value;
                    found = true;
                }
            }

            if (! found) {
                attributeArray.push({ Name: name.toLowerCase(), Value: value });
            }
        }
    }


    /**
     * Set the state of the control block
     * @param {JSON} json - Json object, should be in the same format as the one returned by GetState() function.
     */
    SetState(State) 
    {
        try
        {
            if (State.hasOwnProperty('Value')) { this._currentValue = State.Value; }

            if (State.hasOwnProperty('Properties')) {
                if (State.Properties.hasOwnProperty('IsActive')) { this.SetAttributeValue(this._commonHtmlAttributes, 'active', State.Properties.IsActive); }
                if (State.Properties.hasOwnProperty('IsChecked')) { this.SetAttributeValue(this._commonHtmlAttributes, 'checked', State.Properties.IsChecked); }
                if (State.Properties.hasOwnProperty('IsSelected')) { this.SetAttributeValue(this._commonHtmlAttributes, 'selected', State.Properties.IsSelected); }        
                if (State.Properties.hasOwnProperty('IsDisabled')) { this.SetAttributeValue(this._commonHtmlAttributes, 'disabled', State.Properties.IsDisabled); }
            }
            
            if (State.hasOwnProperty('Attributes')) {
                for(var i = 0; i < State.Attributes.length; i++) {
                    if (State.Attributes[i].Name.startsWith('view-')) {
                        this.SetAttributeValue(this._viewAttributes, State.Attributes[i].Name.substring(5), State.Attributes[i].Value);
                    }
                    else if (State.Attributes[i].Name.startsWith('edit-')) {
                        this.SetAttributeValue(this._editAttributes, State.Attributes[i].Name.substring(5), State.Attributes[i].Value);
                    }
                    else {
                        this.SetAttributeValue(this._commonHtmlAttributes, State.Attributes[i].Name, State.Attributes[i].Value);
                    }
                }
            }
        }
        catch {
            throw 'Input json is not in valid format. Expected properties of class are missing.';
        }
    }


    /**
     * Get the value of an attribute
     * @param {String} collection - Name of the collection to retrieve from
     * @param {*} name - Name of the attribute
     * 
     * @returns {String} - Returns the value of the attribute if found, else undefined.
     */
    GetAttribute(collection, name) {
        switch (collection) {
            case 'view':
                return this.GetAttributeByArray(this._viewAttributes, name);

            case 'edit':
                return this.GetAttributeByArray(this._editAttributes, name);
        }

        return this.GetAttributeByArray(this._commonHtmlAttributes, name);
    }

    /**
     * Get the value of an attribute
     * @param {Array} array - Attribute value array
     * @param {String} name - Name of the attribute
     * 
     * @returns {String} - Returns the value of the attribute if found, else undefined.
     */
    GetAttributeByArray(array, name) {
        for(var i = 0, attr; i < array.length; i++) {
            attr = array[i];
            if (attr.Name === name) {
                return attr.Value;
            }
        }

        return undefined;
    }


    /**
     * Renders the READ view of the field, with an Edit button.
     */
    Render() {
        var html = '<div class="input-group mb-3" id="' + this._controlBlockId + '"><input id="' + this._viewControlId + '" readonly disabled';

        html = this.AttachApplicableAttributes(html, 'view');

        html += ' value="' + this.Value + '" /><div class="input-group-append"><button class="btn btn-outline-secondary" id="editbutton_' + this.OriginalElement.id + '" editjs-action="edit" editjs-id="' + this._controlBlockId + '" type="button">' 
                + '<i class="fa fa-pencil-alt"></i>Edit</button></div></div>';

        return html;
    }


    /**
     * Returns the original element this is running over
     */
    get OriginalElement() { return this._originalElement; }

    get Value() { return this._currentValue; }
    set Value(value) { this._currentValue = value; }

    get EditorControlType() { return this._editorType; }

}

/**
 * Implements a textbox based edit control
 */
class EditJsTextbox extends HtmlEditControlBase {
    constructor(htmlElement) {
        super(htmlElement);
    }

    /**
     * Overrides the base class render method to generate a textbox.
     */
    RenderEdit() {
        var tbType = this.GetAttribute('', 'textbox-style');
        if (tbType === undefined) {
            tbType = 'text';
        }

        var hasClass = false;
        var html = '<div class="input-group mb-3" id="' + this._controlBlockId + '" edit-id="' + this._editControlId + '"><input type="' + tbType + '" id="' + this._editControlId + '"';
        html = this.AttachApplicableAttributes(html, 'edit');

        html += ' value="' + this.Value + '" /><div class="input-group-append">'
                + '<button class="btn btn-outline-secondary" id="' + this._editUpdateButtonId + '" editjs-action="update" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-save"></i>Update</button>'
                + '<button class="btn btn-outline-secondary" id="' + this._editCancelButtonId + '" editjs-action="cancel" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-undo"></i>Cancel</button>'
                + '</div></div>';

        return html;
    }
}


class EditJsCheckbox extends HtmlEditControlBase {
    constructor(htmlElement) {
        super(htmlElement);
    }

    get IsChecked() {
        return false || (this.OriginalElement.getAttribute('checked') === true) || (this.GetAttribute('', 'checked') === true);
    }

    Render() {
        // the 'foo-control' is on purpose! see the replace() calls below to understand it
        var html = '<div class="input-group foo-control border-0 mb-3" id="' + this._controlBlockId + '"><div class="form-check"><input id="' + this._viewControlId + '" type="checkbox" readonly disabled';
        html = this.AttachApplicableAttributes(html, 'view');
        html = html.replace('form-control', 'form-check-input').replace('foo-control', 'form-control');

        if (this.IsChecked) {
            html += ' checked';
        }

        html += ' value="' + this.Value + '" /><label class="form-check-label" for="' + this._viewControlId + '">' + this.GetAttribute('', 'label') + '</label></div>'
                + '<div class="input-group-append"><button class="ml-3 btn btn-sm border-0" id="' + this._viewEditButtonId + '" editjs-action="edit" editjs-id="' + this._controlBlockId + '" type="button">' 
                + '<i class="fa fa-pencil-alt"></i></button></div>';

        return html;
    }


    RenderEdit() {
        // the 'foo-control' is on purpose! see the replace() calls below to understand it
        var html = '<div class="input-group foo-control border-0 mb-3" id="' + this._controlBlockId + '" edit-id="' + this._editControlId + '"><div class="form-check"><input id="' + this._editControlId + '" type="checkbox"';
        html = this.AttachApplicableAttributes(html, 'view');
        html = html.replace('form-control', 'form-check-input').replace('foo-control', 'form-control');

        if (this.IsChecked) {
            html += ' checked';
        }

        html += ' value="' + this.Value + '" /><label class="form-check-label" for="' + this._editControlId + '">' + this.GetAttribute('', 'label') + '</label></div>'
                + '<div class="input-group-append"><button class="ml-3 btn btn-outline-secondary" id="' + this._editUpdateButtonId + '" editjs-action="update" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-save"></i></button>'
                + '<button class="btn btn-outline-secondary" id="' + this._editCancelButtonId + '" editjs-action="cancel" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-undo"></i></button></div>';

        return html;
    }
}

class EditJsRadioList extends HtmlEditControlBase {
    constructor(htmlElement) {
        super(htmlElement);
    }

    get IsChecked() {
        return false || (this.OriginalElement.getAttribute('checked') === true) || (this.GetAttribute('', 'checked') === true);
    }

    Render() {
        // Options in a radio-list are defined using datalist objects on the page
        var dataListId = this.GetAttribute('', 'list');
        if (dataListId === undefined) {
            throw 'Radio editors must define a "list" property pointing to a DataList element on the page.';
        }

        var dataList = document.getElementById(dataListId);
        if (dataList === undefined) {
            throw 'DataList defined by "' + dataListId + '" not found on the page.';
        }

        var dataListElements = dataList.getElementsByTagName('option');

        var html = '<div class="table ml-3" id="' + this._controlBlockId + '"><div class="row">';
        for(var dli = 0; dli < dataListElements.length; dli++) {
            var itemLabel = dataListElements[dli].innerText, itemValue = dataListElements[dli].value;

            html += '<div class="col-sm">';
            html += this.AttachApplicableAttributes('<div class="form-check"><input id="' + this._viewControlId + '_' + dli.toString() + '" name="' + this._formElementId + '" type="radio" readonly disabled', 'view');
            html = html.replace('form-control', 'form-check-input');
            if (this.Value === itemValue) {
                html += ' checked';
            }
            html += ' value="' + itemValue + '" /><label class="form-check-label" for="' + this._viewControlId + '_' + dli.toString() + '">' + itemLabel + '</label></div>'
                + '<div class="input-group-append"></div>';
            html += '</div>';
        }
        html += '<div class="col-sm"><button class="ml-3 btn btn-sm border-0" id="' + this._viewEditButtonId + '" editjs-action="edit" editjs-id="' + this._controlBlockId + '" type="button">' 
        + '<i class="fa fa-pencil-alt"></i></button></div>';
        html += '<div class="col-sm">&nbsp;</div></div></div>';

        return html;
    }


    RenderEdit() {
        // Options in a radio-list are defined using datalist objects on the page
        var dataListId = this.GetAttribute('', 'list');
        if (dataListId === undefined) {
            throw 'Radio editors must define a "list" property pointing to a DataList element on the page.';
        }

        var dataList = document.getElementById(dataListId);
        if (dataList === undefined) {
            throw 'DataList defined by "' + dataListId + '" not found on the page.';
        }

        var dataListElements = dataList.getElementsByTagName('option');

        var html = '<div class="table ml-3" id="' + this._controlBlockId + '" edit-id="' + this._controlBlockId + ' input[type=radio]"><div class="row">';
        for(var dli = 0; dli < dataListElements.length; dli++) {
            var itemLabel = dataListElements[dli].innerText, itemValue = dataListElements[dli].value;

            html += '<div class="col-sm">';
            html += this.AttachApplicableAttributes('<div class="form-check"><input id="' + this._viewControlId + '_' + dli.toString() + '" name="' + this._formElementId + '" type="radio"', 'edit');
            html = html.replace('form-control', 'form-check-input');
            if (this.Value === itemValue) {
                html += ' checked';
            }
            html += ' value="' + itemValue + '" /><label class="form-check-label" for="' + this._viewControlId + '_' + dli.toString() + '">' + itemLabel + '</label></div>'
                + '<div class="input-group-append"></div>';
            html += '</div>';
        }
        html += '<div class="col-sm"><div class="input-group-append"><button class="ml-3 btn btn-outline-secondary" id="' + this._editUpdateButtonId + '" editjs-action="update" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-save"></i></button>'
                + '<button class="btn btn-outline-secondary" id="' + this._editCancelButtonId + '" editjs-action="cancel" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-undo"></i></button></div></div>';
        html += '<div class="col-sm">&nbsp;</div></div></div>';

        return html;
    }
}

class EditJsSelectList extends HtmlEditControlBase {
    constructor(htmlElement) {
        super(htmlElement);
    }

    testIsOneOfSelectedValues(value) {
        if (this.GetAttribute('', 'allow-multiple') === 'true') {
            if (this._currentValue.length > 0) {
                if (Array.isArray(this._currentValue)) {
                    return this._currentValue.includes(value);
                }
            }
        }

        return (this._currentValue === value);
    }

    Render() {
        // Options in a select-list are defined using datalist objects on the page
        var dataListId = this.GetAttribute('', 'list');
        if (dataListId === undefined) {
            throw 'Radio editors must define a "list" property pointing to a DataList element on the page.';
        }

        var dataList = document.getElementById(dataListId);
        if (dataList === undefined) {
            throw 'DataList defined by "' + dataListId + '" not found on the page.';
        }

        var html = '<div class="input-group mb-2" id="' + this._controlBlockId + '" edit-id="' + this._editControlId + '"><select id="' + this._viewControlId + '" class="form-control" readonly disabled' + ((this.GetAttribute('', 'allow-multiple') === 'true') ? ' multiple' : '') + '>';

        var groupsOrItems = dataList.childNodes;
        for(var i = 0; i < groupsOrItems.length; i++) {
            var type = groupsOrItems[i].nodeName.toLowerCase();
            if (type === 'optgroup') {
                html += '<optgroup label="' + groupsOrItems[i].label + '">';
                
                var groupItems = groupsOrItems[i].childNodes;
                for(var j = 0; j < groupItems.length; j++) {
                    var t2 = groupItems[j].nodeName.toLowerCase();
                    if (t2 === 'option') {
                        html += '<option value="' + groupItems[j].value + '"' + (this.testIsOneOfSelectedValues(groupItems[j].value) ? ' selected' : '') + '>' + groupItems[j].innerText + '</option>';
                    }
                }

                html += '</optgroup>';
            }
            else if (type === 'option') {
                html += '<option value="' + groupsOrItems[i].value + '"' + (this.testIsOneOfSelectedValues(groupsOrItems[i].value) ? ' selected' : '') + '>' + groupsOrItems[i].innerText + '</option>';
            }
        }

        html += '</select>'

        html += '<div class="input-group-append"><button class="ml-3 btn btn-sm border-0" id="' + this._viewEditButtonId + '" editjs-action="edit" editjs-id="' + this._controlBlockId + '" type="button">' 
        + '<i class="fa fa-pencil-alt"></i></button></div></div>';

        return html;
    }


    RenderEdit() {
        // Options in a select-list are defined using datalist objects on the page
        var dataListId = this.GetAttribute('', 'list');
        if (dataListId === undefined) {
            throw 'Radio editors must define a "list" property pointing to a DataList element on the page.';
        }

        var dataList = document.getElementById(dataListId);
        if (dataList === undefined) {
            throw 'DataList defined by "' + dataListId + '" not found on the page.';
        }

        var html = '<div class="input-group mb-2" id="' + this._controlBlockId + '" edit-id="' + this._editControlId + '"><select id="' + this._editControlId + '" class="form-control"' + ((this.GetAttribute('', 'allow-multiple') === 'true') ? ' multiple' : '') + '>';

        var groupsOrItems = dataList.childNodes;
        for(var i = 0; i < groupsOrItems.length; i++) {
            var type = groupsOrItems[i].nodeName.toLowerCase();
            if (type === 'optgroup') {
                html += '<optgroup label="' + groupsOrItems[i].label + '">';
                
                var groupItems = groupsOrItems[i].childNodes;
                for(var j = 0; j < groupItems.length; j++) {
                    var t2 = groupItems[j].nodeName.toLowerCase();
                    if (t2 === 'option') {
                        html += '<option value="' + groupItems[j].value + '"' + (this.testIsOneOfSelectedValues(groupItems[j].value) ? ' selected' : '') + '>' + groupItems[j].innerText + '</option>';
                    }
                }

                html += '</optgroup>';
            }
            else if (type === 'option') {
                html += '<option value="' + groupsOrItems[i].value + '"' + (this.testIsOneOfSelectedValues(groupItems[j].value) ? ' selected' : '') + '>' + groupsOrItems[i].innerText + '</option>';
            }
        }

        html += '</select>'

        html += '<div class="input-group-append"><button class="ml-3 btn btn-outline-secondary" id="' + this._editUpdateButtonId + '" editjs-action="update" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-save"></i></button>'
                + '<button class="btn btn-outline-secondary" id="' + this._editCancelButtonId + '" editjs-action="cancel" editjs-id="' + this._controlBlockId + '" type="button">' 
                +   '<i class="fa fa-undo"></i></button></div></div>';

        return html;
    }
}


/**
 * Implements a file upload control
 */
class EditJsUpload extends HtmlEditControlBase {
    constructor(htmlElement) {
        super(htmlElement);

        this._maxFiles = this.GetAttribute('', 'maxfiles');
        if ((this._maxFiles === undefined) || (this._maxFiles === null) || (this._maxFiles === '')) {
            this._maxFiles = '1';
        }
        this._maxFiles = parseInt(this._maxFiles);

        this._useDropzoneJs = this.GetAttribute('', 'use-dropzonejs');
        if ((this._useDropzoneJs === undefined) || (this._useDropzoneJs === null) || (this._useDropzoneJs === '')) {
            this._useDropzoneJs = 'false';
        }
        this._useDropzoneJs = ((this._useDropzoneJs === 'true') ? true : false);

        this._acceptFileTypes = this.GetAttribute('', 'accept-types');
        if ((this._acceptFileTypes === undefined) || (this._acceptFileTypes === null) || (this._acceptFileTypes === '')) {
            this._acceptFileTypes = 'image/png,image/jpg';
        }
        this._acceptFileTypes = this._acceptFileTypes.split(',');

        this._uploadMaxSizeLimitMB = this.GetAttribute('', 'accept-maxsize');
        if ((this._uploadMaxSizeLimitMB === undefined) || (this._uploadMaxSizeLimitMB === null) || (this._uploadMaxSizeLimitMB === '')) {
            this._uploadMaxSizeLimitMB = '2';
        }
        this._uploadMaxSizeLimitMB = parseInt(this._uploadMaxSizeLimitMB);
    }


    GetFileIconByExtension(fileName) {
        var ei = fileName.lastIndexOf('.');
        var extension = fileName.substring(ei).toLowerCase();
        var icon = 'file';
        switch (extension) {
            case '.zip':
            case '.tar':
            case '.gz':
            case '.rar':
            case '.7z':
            case '.img':
            case '.dmg':
            case '.iso':
            case '.z':
                icon = 'file-archive';
                break;

            case '.doc':
            case '.docx':
            case '.docm':
            case '.dot':
            case '.dotx':
                icon = 'file-word';
                break;

            case '.xls':
            case '.xlsx':
            case '.xlsm':
                icon = 'file-excel';
                break;

            case '.ppt':
            case '.pptx':
            case '.pot':
            case '.potx':
                icon = 'file-powerpoint';
                break;

            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.bmp':
            case '.gif':
            case '.tiff':
            case '.tif':
            case '.tga':
                icon = 'file-image';
                break;

            case '.wav':
            case '.mp3':
            case '.ogg':
            case '.wma':
                icon = 'file-audio';
                break;

            case '.mpg':
            case '.mpeg':
            case '.mp4':
            case '.wmv':
            case '.flv':
                icon = 'file-video';
                break;

            case '.csv':
                icon = 'file-csv';
                break;

            case '.txt':
                icon = 'file-alt';
                break;

            case '.pdf':
                icon = 'file-pdf';
                break;
        }

        return icon;
    }


    Render() {
        var html = '<div class="input-group mb-3 ml-3" id="' + this._controlBlockId + '">';

        if (! this._useDropzoneJs) {

            html += '<div class="table"><div class="row"><div class="col-sm-2"><p>Current uploads:</p><ol class="mt-2">';
            
            var files = this.Value.split(',');
            for(var f = 0; f < files.length; f++) {
                var n = files[f].lastIndexOf('/'), name = files[f].substring(n+1);
                html += '<li><i class="fa fa-' + this.GetFileIconByExtension(name) + '"></i>' + name + '</li>';
            }
            
            html += '</ol></div><div class="col-sm">'
                    + '<p>Upload a new file here:</p>'
                    + '<input type="file" class="form-control-file" ' + (this._allowMultipleFiles ? 'multiple' : '') + ((this._acceptFileTypes.length > 0) ? 'accept="' + this._acceptFileTypes.join(',') + '"' : '') + ' />'
                    + '</div></div></div>';
        }
        else {

        }

        html += '</div>';        
        return html;
    }

    RenderEdit() {
        return this.Render();
    }
}

/**
 * Implements a control that surfaces a single image UX and lets the user change the picture with another picture.
 */
class EditJsImageUpload extends EditJsUpload {
    constructor(htmlElement) {
        super(htmlElement);
    }

    Render() {
        var html ='<div class="input-group mb-3" id="' + this._controlBlockId + '">';

        if (! this._useDropzoneJs) {
            html += '<div class="table"><div class="row"><div class="col-sm-2"><img src="' + this.Value + '" style="width: 220px !important; opacity: 1 !important;" /></div><div class="col-sm">'
                    + '<p>Upload a new image here:</p>'
                    + '<input type="file" class="form-control-file" ' + (this._allowMultipleFiles ? 'multiple' : '') + ((this._acceptFileTypes.length > 0) ? 'accept="' + this._acceptFileTypes.join(',') + '"' : '') + ' />'
                    + '</div></div></div>';
        }
        else {
            html += '<img src="' + this.Value + '" id="' + this._viewEditButtonId + '" onclick="return showPopupForm(\'#' + this.GetAttribute('', 'popupform-id') + '\');" style="width: 220px !important; opacity: 1 !important; cursor: pointer;" />';
        }

        html += '</div>';        
        return html;
    }
}


/**
 * Implements a Form
 */
class EditJsForm {
    _Fields = new Array();
    _DropZoneForms = new Array();
        
    constructor(formLocator) {
        var form = this;
        var fields = document.getElementsByTagName('editjs'), field_ids = new Array();
        for(var i = 0; i < fields.length; i++) {
            var element = fields[i];
            field_ids.push(element.id);
            switch (element.getAttribute('editor').toLowerCase())
            {
                case "text": 
                    form._Fields.push(new EditJsTextbox(element));
                    break;

                case "checkbox":
                    form._Fields.push(new EditJsCheckbox(element));
                    break;

                case "radio":
                    form._Fields.push(new EditJsRadioList(element));
                    break;

                case "dropdown":
                    form._Fields.push(new EditJsSelectList(element));
                    break;

                case "upload":
                    var ut = element.getAttribute('type');
                    if ((ut === undefined) || (ut === null) || (ut === '')) {
                        ut = 'file';
                    }

                    var uploadEditor = null;
                    switch (ut.toLowerCase()) {
                        case "image":
                            uploadEditor = new EditJsImageUpload(element);
                            break;

                        default:
                            uploadEditor = new EditJsUpload(element);
                            break;
                    }

                    if (uploadEditor !== null) {
                        form._Fields.push(uploadEditor);

                        if (uploadEditor._useDropzoneJs) {
                            this._DropZoneForms.push({
                                OriginControlId: uploadEditor._controlBlockId,
                                PopupId: uploadEditor.GetAttribute('', 'popupform-id'),
                                FormId: uploadEditor.GetAttribute('', 'popupform-formid'),
                                PhotoFieldName: uploadEditor.GetAttribute('', 'ajax-upload-formfieldname'),
                                MaxFiles: uploadEditor._maxFiles,
                                MaxFileSizeMB: uploadEditor._uploadMaxSizeLimitMB,
                                FileTypes: uploadEditor._acceptFileTypes.join(',')
                            });
                        }
                    }

                    break;
            }
        }

        for(var i = 0; i < field_ids.length; i++) {
            document.getElementById(field_ids[i]).outerHTML = '<div id="editjs_' + field_ids[i] + '"></div>';
        }
        
    }

    GetField(name) {
        for(var i = 0; i < this._Fields.length; i++) {
            if (this._Fields[i]._controlBlockId === name) {
                return this._Fields[i];
            }
        }

        return undefined;
    }

    Render() {
        for(var i = 0; i < this._Fields.length; i++) {
            var originalId = this._Fields[i]._controlBlockId;
            document.getElementById(originalId).outerHTML = this._Fields[i].Render();
        }
    }
    
    RenderEditControl(id) {
        for(var i = 0; i < this._Fields.length; i++) {
            var control_id = this._Fields[i]._controlBlockId;
            if (control_id === id) {
                document.getElementById(control_id).outerHTML = this._Fields[i].RenderEdit();
                return;
            }            
        }
    }

    RenderViewControl(id, newValue) {
        for(var i = 0; i < this._Fields.length; i++) {
            var control_id = this._Fields[i]._controlBlockId;
            if (control_id === id) {
                if ((newValue !== undefined) && (newValue !== false) && (newValue !== '')) {
                    this._Fields[i].Value = newValue;
                }
                document.getElementById(control_id).outerHTML = this._Fields[i].Render();
                return;
            }            
        }
    }

}


/* These are document-level code: */

var editForm = null, dzArray = new Array();

Dropzone.autoDiscover = false;

$(document).ready(function() {
    editForm = new EditJsForm('form[mode=editjs]');
    editForm.Render();

    for(var d = 0; d < editForm._DropZoneForms.length; d++) {
        var dz, State = editForm._DropZoneForms[d];

        $('#' + State.PopupId).modal(
            {
                backdrop: 'static',
                keyboard: false,
                focus: true,
                show: false,
            }
        );

        dz = new Dropzone('#' + State.FormId, {
            paramName: State.PhotoFieldName,
            maxFiles: 1,
            maxFilesize: State.MaxFileSizeMB,  // MB
            headers: {
                "Ocp-Apim-Subscription-Key": "b4e5a75b95f948c78cf765c29512995d",
                "Ocp-Apim-Trace": true
            },
            acceptedFiles: State.FileTypes
        });

        dz.on("success", function (file, response) {
            this.removeFile(file);

            if (response.hasOwnProperty('path')) {
                response = response.path;
            }

            editForm.GetField(State.OriginControlId).SetState(
                {
                    Value: response
                }
            );
            editForm.RenderViewControl(State.OriginControlId);
            $('#' + State.PopupId).modal('hide');
        });

        dzArray.push(dz);
    }

    // find and reroute the submit button to our handler
    var submitter = $('form[mode=editjs] button[type=submit]');
    if (submitter.length === 0) {
        submitter = $('form[mode=editjs] button[type=submit]');
    }

    if (submitter.length > 0) {
        submitter.attr('type', 'button');
        submitter.on('click', function() {
            $('form[mode=editjs] input').each(function(index, element) {
                if ($(element).prop('disabled')) {
                    $(element).prop('disabled', false);
                }

                var name = element.id.substring(6);
                $(element).attr('name', name);
            });

            $('form[mode=editjs]').submit();
        });
    }
});

$(document).on('click', 'button[editjs-action=edit]', function() {
    var control_id = $(this).attr('editjs-id');
    editForm.RenderEditControl(control_id);
});

$(document).on('click', 'button[editjs-action=update]', function() {
    var control_block_id = $(this).attr('editjs-id');
    var control_id = $('#' + control_block_id).attr('edit-id');

    var ctl = $('#' + control_id), type = ctl[0].nodeName.toLowerCase();
    var newValue = '';

    switch (type) {
        case "input":
            switch (ctl[0].type.toLowerCase())  {
                case "color":
                case "date":
                case "datetime-local":
                case "email":
                case "month":
                case "number":
                case "password":
                case "range":
                case "search":
                case "tel":
                case "text":
                case "time":
                case "url":
                case "week":
                    newValue = ctl.val();
                    break;

                case "checkbox":
                    var isChecked = (ctl.prop('checked') === true);
                    var chk = editForm.GetField(control_block_id);
                    chk.SetState({
                        Value: ctl.val(),
                        Properties: {
                            IsChecked: isChecked
                        }
                    });
                    break;

                case "radio":
                    var checkedValue = '';
                    for(var ri = 0; ri < ctl.length; ri++) {
                        if (ctl[ri].checked) {
                            checkedValue = ctl[ri].value;
                            break;
                        }
                    }

                    var rdo = editForm.GetField(control_block_id);
                    rdo.SetState({
                        Value: checkedValue
                    });
                    break;

                case "file":
                    /* TODO */
                    break;
            }
            break;

        case "select":
            var lst = editForm.GetField(control_block_id);
            lst.SetState({
                Value: ctl.val()
            });
            break;
    }

    editForm.RenderViewControl(control_block_id, newValue);
});

$(document).on('click', 'button[editjs-action=cancel]', function() {
    var control_id = $(this).attr('editjs-id');
    editForm.RenderViewControl(control_id);
});

function showPopupForm(id) {
    $(id).modal('show');
    return true;
}
