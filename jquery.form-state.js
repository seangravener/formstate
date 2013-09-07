/*!
 * form state - save the state of a form using localstorage
 * Copyright (c) 2013 Sean Gravener
 * https://github.com/seangravener
 *
 * Saves the state of a form (or forms) in localStorage
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
      settings = {
        initComplete      : function() {},
        saveComplete      : function() {},
        skipComplete      : function() {},
        clearComplete     : function() {},
        hasFormData       : null,
        clearOnExit       : false,
        confirmDeleteText : '',
        key_prefix        : 'key_',
        triggers: {
          save            : '.fs-trigger--save',
          skip            : '.fs-trigger--skip',
          clear           : '.fs-trigger--clear'
        }
      },
      
      // merge custom options/settings with defaults
      settings = $.extend( settings, options );

    var init = {

      // init function used to populate a form with stored data
      populateForm: function( $form, storedFields ) {
      
        // itirate over each stored value
        for ( var i=0; i < storedFields.length; i++ ) {

          var storedFieldName   = storedFields[i].name,
              storedFieldValue  = storedFields[i].value,
              $field            = $form.find( "[name='" + storedFieldName + "']" ),
              fieldType         = $field.attr( 'type' ),
              fieldValue        = $field.val();

          // checkboxes and radios use the same name attr; handle that here
          if ( fieldType == 'checkbox' || fieldType == 'radio' ) {
            
            // jQuery is smart enough to create an array of objects when a 
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

            // not a checkbox or radio; fill the field with the stored value
            $field.val( storedFieldValue );

          }
        }

        return true;
      
      }
    };

    // helper function for callbacks
    var callback = function ( func, object, data ) {
        
      // make the callback, pass the object and data
      settings[ func ].call( object, data );

    };

    // functions that deal with attaching and hanlding click events
    // based on the defined triggers
    var triggers = {
      
      init: function ( $object ) {

        var keys          = Object.keys( settings.triggers ),
            numOfTriggers = Object.keys( settings.triggers ).length;

        for ( var i=0; i < numOfTriggers; i++ ) {
          
          // the current trigger
          key = keys[ i ];

          // attach the click handler to the DOM element
          triggers.attach( settings.triggers[ key ], triggers[ key ], $object );

        }

      },

      attach: function ( selector, func, $object ) {

        $object.find( selector ).on( 'click', function( e ) {
          
          e.preventDefault();           
          return func( $object );

        });
        
      },

      save: function ( $object ) {

        var key     = settings.key_prefix + $object.attr('name'),
            val     = JSON.stringify( $object.serializeArray() ),
            success = $.totalStorage(key, val);

        callback ( 'saveComplete', $object, val );

      },

      skip: function ( $object ) {
        
        callback ( 'skipComplete', $object, null );
        
      },

      clear: function ( $object ) {

        // delete stored data by default
        var deleteData = true;

        // if text is set, prompt the user
        if ( settings.confirmDeleteText ) deleteData = confirm( settings.confirmDeleteText );
        
        if ( deleteData ) {
          
          // delete the stored data
          var key     = settings.key_prefix + $object.attr( 'name' ),
              success = $.totalStorage.deleteItem( key );

          // clear the form fields
          $object[0].reset();

          callback ( 'clearComplete', $object, null );

        }

      }

    };

    // 'this' is the jQuery object(s) returned to the plugin;
    // we use .each() in case multiple objects are returned;
    // we 'return' so the method is chainable
    return this.each ( function () {
      
      // cache the current object and attempt 
      // to retrieve any stored data
      var $this     = $(this),
          key       = settings.key_prefix + $this.attr( 'name' ),
          data      = $.totalStorage( key ),
          $data;

      // attach click handlers within '$this' context 
      // using the triggers in the settings
      triggers.init( $this );

      if ( data ) {

        var data    = JSON.parse( data ),
            $data   = $(data),
            success = init.populateForm( $this, data );

      }

      callback ( 'initComplete', $this, $data );

    });

  }

})(jQuery);