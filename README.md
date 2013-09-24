# Form State

**Form State** is a jQuery plugin that saves the state of a form in localStorage

# Features
* save, update and delete form data
* if a form contains saved data, Form State will populate the form.
* group multiple forms in one JSON object using a custom ```data-attribute```

# Basic Usage
Form State uses the ```name=""``` attribute of the form as the storage key (with an optional prefix).

Save all ```<form>``` tags
```javascript
$('form').formState( options );
```

## Options
* ```groupDataAttrib``` defines the name of the custom data attribute used to group forms together (eg. ```data-fs-group="my-form-group"```).
* ```confirmDeleteText``` defines the text used to prompt a user confirm a form should be deleted. If left blank, forms are deleted without prompting a user.
* ```key_prefix``` defines the string prefixed to the localStorage key.

### Triggers
Triggers are context sensative. They will only affect the ```<form>``` in which they are placed within.
* ```triggers.save``` defines the selector used to save a form.
* ```triggers.clear``` defines the selector used to delete a form.
* ```triggers.skip``` defines the selector used to skip a form.

### Example
```javascript
options = {
    groupDataAttrib   : 'fs-group',
    confirmDeleteText : '',
    key_prefix        : 'key_',
    triggers: {
      save            : '.fs-trigger--save',
      skip            : '.fs-trigger--skip',
      clear           : '.fs-trigger--clear'
    }
};

$('form').formState( options );
```

### Single Form Example
**form name:** form__user-info
```javascript
[{name: 'firstName', value: 'Joe'}, {name: 'lastName', value: 'Smith'}]
```
### Grouped Form Example
**form 1 name:** form__user-info
**form 2 name:** form__user-favs
**data-fs-group:** forms__user-data
```javascript
{ 
  key_form__user-favs:
    [{name:favColor,value:red},{name:favCar,value:ford}],
  key_form__user-meta:
    [{name:name[first],value:'Joe'},{name:name[last],value:'Smith'}]
}
```

### Callbacks
Callbacks can be used to do something once a method is finished. 
```javascript
$('form').formState({

    initComplete: function( $data ) {
        // do something after init;
        // 'this' keyword is the jquery object contianing the <form> tag
        // $data is a jQuery object containing loaded form data 
    },

    saveComplete: function( $data ) {
        // do something after save
        // 'this' keyword is the jquery object contianing the <form> tag
        // $data is a jQuery object containing saved form data 
    },

    clearComplete: function() {
        // do something after deleting data
        // 'this' keyword is the jquery object contianing the <form> tag
    }

});
```

### HTML Example
Create a HTML form and give it a name. The save and delete triggers (identified using class names) should be placed within the ```<form>``` tag they're associated with.
```html
<form name="my-form">
    <input type="text" name="name[first]">
    <input type="text" name="name[last]">
    
    <input type="submit" class="fs-trigger--save">Save</a>
    <input type="submit" class="fs-trigger--clear">Delete</a>
    <input type="submit" class="fs-trigger--skip">Skip</a>
</form>
```

## Requirements
* jQuery 1.7.1
* totalStorage jQuery plugin by Jared Novack & Upstatement
([https://github.com/jarednova/jquery-total-storage](https://github.com/jarednova/jquery-total-storage))

## Browser Support
* All major browsers supporting localStorage are supported
* totalStorage requires $.cookie plugin by Klaus Hartl to support cookie fallback in IE8
([https://github.com/carhartl/jquery-cookie](https://github.com/carhartl/jquery-cookie))

## Future
* expose CRUD methods