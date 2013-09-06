/**!
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

;(function($, undefined){

  $.fn.formState = function( options ) {

    var 
      
      // set defaults
      settings = {
        initComplete      : null,
        hasFormData       : null,
        saveComplete      : null,
        skipComplete      : null,
        clearComplete     : null,
        clearOnExit       : false,  
        key_prefix        : 'key_',
        triggers: {
          save            : '.fs-trigger--save',
          skip            : '.fs-trigger--skip',
          clear           : '.fs-trigger--clear'
        }
      },
      
      settings = $.extend( settings, options );

    var init = {

      populateForm: function( $form, storedFields ) {
      
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
              
              // set the stored value as the active element
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

    var callback = function ( func, object, data ) {
      if ( $.isFunction( settings[ func ] ) ) {
        settings[ func ].call( object, data );
      }
    };

    var triggers = {
      
      init: function ( $object ) {

        var keys          = Object.keys( settings.triggers ),
            numOfTriggers = Object.keys( settings.triggers ).length;

        for ( var i=0; i < numOfTriggers; i++ ) {
          
          // the current trigger
          key = keys[ i ];

          // attach the click handler for the current key in the triggers obj
          triggers.attach( settings.triggers[ key ], triggers[ key ], $object );

        }

      },

      attach: function (selector, func, $object) {

        $object.find( selector ).on('click', function(e) {
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

        var key     = settings.key_prefix + $object.attr('name'),
            success = $.totalStorage.deleteItem(key);

        callback ( 'clearComplete', $object, null );
      }

    };

    return this.each ( function () {
      
      var $this = $(this),
          key = settings.key_prefix + $this.attr( 'name' ),
          data = $.totalStorage( key ),
          $data;

      // attach click handlers within $this context
      triggers.init( $this );

      if ( data ) {

        var data    = JSON.parse( data ),
            $data   = $(data),
            success = init.populateForm( $this, data );

      }

      // fire callback
      callback ( 'initComplete', $this, $data );

    });

  }

})(jQuery);