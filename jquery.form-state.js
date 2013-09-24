/*!
 * Form State 
 * Saves the state of a form (or forms) in localStorage
 * 
 * Copyright (c) 2013 Sean Gravener
 * https://github.com/seangravener
 * 
 * Requires totalStorage jQuery Plugin by Jared Novack & Upstatement
 * https://github.com/jarednova/jquery-total-storage
 *
 * Usage:

    $('form').formState(options);
 
 */

// create closure
;(function($, undefined){

  $.fn.formState = function( options ) {

    var 
      
      // set defaults
      defaults = {
        groupDataAttrib   : 'fs-group',
        initComplete      : function() {},
        saveComplete      : function() {},
        skipComplete      : function() {},
        clearComplete     : function() {},
        hasFormData       : function() {},  // future feature
        clearOnExit       : false,          // future feature
        confirmDeleteText : '',
        key_prefix        : '',
        triggers: {
          save            : '.fs-trigger--save',
          skip            : '.fs-trigger--skip',
          clear           : '.fs-trigger--clear'
        }
      },
      
      // merge custom settings with defaults
      settings = $.extend( defaults, options );

    var init = {

      getGroupKey: function ( $form ) {
        
        var group = $form.data( settings.groupDataAttrib );

        if ( group )
          return group;

      },

      saveData: function ( key, val, group ) {

        var val        = $.parseJSON( val ),
            success;

        if ( group ) {

          var data       = {},
              groupKey   = prefix( group ),
              storedData = $.totalStorage( groupKey );

          if ( storedData ) {
            data = $.parseJSON( storedData );
          }

          data[ key ] = val;
          key         = prefix( group );

        }
        
        else {
          data = val;
        }

        data = JSON.stringify( data );

        return success = $.totalStorage( key, data );

      },

      deleteData: function ( key, group ) {

        if ( group ) {

          var groupKey   = prefix( group ),
              storedData = $.totalStorage( groupKey ),
              storedData = $.parseJSON( storedData );

          delete storedData[ key ];

          keys = Object.keys( storedData );

          if ( keys.length ) {

            // re-save
            var data = JSON.stringify( storedData );
            $.totalStorage( groupKey, data );

          }

          else {
            $.totalStorage.deleteItem( groupKey );
          }

        }

        else {
          $.totalStorage.deleteItem( key );
        }

      },

      // init function used to populate a form with stored data
      populateForm: function( $form, storedFields, group ) {
   
        var key;

        if ( group ) {
          
          key          = prefix( $form.attr('name') );
          storedFields = storedFields[ key ];

        }

        // itirate over each stored value
        for ( i in storedFields ) {

          var storedFieldName   = storedFields[i].name,
              storedFieldValue  = storedFields[i].value,
              $field            = $form.find( "[name='" + storedFieldName + "']" ),
              fieldType         = $field.attr( 'type' ),
              fieldValue        = $field.val();

          // checkboxes and radios use the same name attr; handle that here
          if ( fieldType == 'checkbox' || fieldType == 'radio' ) {
            
            // jQuery creates an array of objects when a 
            // selector returns more than one element;
            // here, we loop through each radio or checkbox <input>
            $field.each( function() {
              
              // this refers to the current item in .each();
              // here, we cache it as a jquery object
              $this = $(this);
              
              // set the stored value as checked
              if ( $this.val() == storedFieldValue ) $this.attr('checked', true);

            });
          
          }
          else {

            // not a checkbox or radio; fill with the stored value.
            $field.val( storedFieldValue );

          }
        }

        return true;
      
      }
    };

    // helper function for callbacks
    var callback = function ( func, $object, $data ) {
        
      // make the callback, pass the object and data
      settings[ func ].call( $object, $data );

    };

    var clearFields = function( $form ) {
      
      var fields      = $form[ 0 ].elements,
          fieldType;

      for ( i = 0; i < fields.length; i++ ) {
        fieldType = fields[ i ].type.toLowerCase();

        switch ( fieldType ) {
          case "text":
          case "password":
          case "textarea":
          case "hidden":
            fields[ i ].value = ""; 
            break;
          
          case "radio":
          case "checkbox":
            if ( fields[i].checked )
              $form[ 0 ].elements[ i ].checked = false;
            break;

          case "select-one":
          case "select-multi":
            fields[ i ].selectedIndex = -1;
            break;

          default:
            break;
        }

      }

    };

    // functions that deal with attaching and hanlding click events
    // based on the defined triggers
    var triggers = {
      
      init: function ( $form ) {

        var keys = Object.keys( settings.triggers );

        for ( i in keys ) {
          
          // the current trigger
          key = keys[ i ];

          // attach the click handler to the DOM element
          triggers.attach( settings.triggers[key], triggers[key], $form );

        }

      },

      attach: function ( selector, func, $scope ) {

        $scope.find( selector ).on('click', function(e) {
          
          e.preventDefault();           
          return func( $scope );

        });
        
      },

      save: function ( $form ) {

        // @TODO - remove empty key/value pairs from stored JSON object

        var key     = prefix( $form.attr('name') ),
            val     = JSON.stringify( $form.serializeArray() ),
            group   = init.getGroupKey( $form ),
            success = init.saveData ( key, val, group ),
            data    = $.parseJSON( val );

        callback ( 'saveComplete', $form, $(data) );

      },

      skip: function ( $form ) {
        
        clearFields ( $form );
        callback ( 'skipComplete', $form, null );
        
      },

      clear: function ( $form ) {

        // delete stored data by default
        var deleteData = true;

        // if text is set, prompt the user
        if ( settings.confirmDeleteText ) deleteData = confirm( settings.confirmDeleteText );
        
        if ( deleteData ) {
          
          var group   = init.getGroupKey( $form ),
              key     = prefix ( $form.attr('name') ),
              success = init.deleteData( key, group );

          clearFields ( $form );
          callback ( 'clearComplete', $form, null );

        }

      }

    };

    var prefix = function ( string ) {
      return settings.key_prefix + string;
    };

    // 'this' is the jQuery object(s) returned to the plugin;
    // .each() is used in case multiple objects are returned;
    // returned so the method is chainable.
    return this.each ( function () {
      
      // cache the current object and attempt 
      // to retrieve any stored data
      var $this     = $(this),
          group     = init.getGroupKey( $this ),
          groupKey  = prefix( group ),
          formKey   = prefix( $this.attr('name') ),
          key       = ( group ) ? groupKey : formKey;

      var data      = $.totalStorage( key ),
          $data     = null;

      // attach click handlers within '$this' context 
      // using the triggers in the settings
      triggers.init( $this );

      if ( data ) {

        var data    = $.parseJSON( data ),
            success = init.populateForm( $this, data, group );

        if ( group ) 
          data = data[ formKey ];
        
        if ( data )
          $data = $(data);

      }

      callback ( 'initComplete', $this, $data );

    });

  }

})(jQuery);