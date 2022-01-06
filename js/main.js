/**
 * Address Auto Complete - a REDCap External Module
 * Author: Ekin Tertemiz
*/

var STPH_addressAutoComplete = STPH_addressAutoComplete || {};

// Debug logging
STPH_addressAutoComplete.log = function() {
  if (STPH_addressAutoComplete.debug) {
      switch(arguments.length) {
          case 1: 
              console.log(arguments[0]); 
              return;
          case 2: 
              console.log(arguments[0], arguments[1]); 
              return;
          case 3: 
              console.log(arguments[0], arguments[1], arguments[2]); 
              return;
          case 4:
              console.log(arguments[0], arguments[1], arguments[2], arguments[3]); 
              return;
          default:
              console.log(arguments);
      }
  }
};


// Initialization
STPH_addressAutoComplete.init = function() {

  STPH_addressAutoComplete.log("Address auto-complete module has been initialized");
  STPH_addressAutoComplete.log(STPH_addressAutoComplete);

  //  Set target field
  var target_field = $('#'+STPH_addressAutoComplete.target_field+'-tr').find('input');
  target_field.hide();

  var target_meta = $('#' + STPH_addressAutoComplete.target_meta + '-tr').find('input');

  //  Add Address Auto Complete Input Markdown
  var autoCompleteInput = '<small id="accStatusHelper" class="form-text text-muted mb-1 mt-3"><span id="aac-status">'+ STPH_addressAutoComplete.lang.aac_status_default +'</span></small></small><div style="padding-right:10%;" class="input-group mb-3"><div class="input-group-prepend"><span class="input-group-text" id="basic-addon1"><i class="fas fa-map-marker-alt"></i></span></div><input value="'+target_field.val()+'" id="address-auto-complete-' + STPH_addressAutoComplete.target_field + '" type="text" class="form-control address-auto-complete-input" placeholder="" aria-label="Address" aria-describedby="basic-addon1"><small id="autoCompleteHelp" class="form-text text-muted"><span id="aac-selection"></span><br><span id="aac-meta">Meta: <span id="aac-meta-preview"></span></span></small></div>';
  target_field.parent().prepend(autoCompleteInput);

  //  Add Custom Address Modal Markdown (if enabled)
  if(STPH_addressAutoComplete.customAddress) {

    var customAddressModalWrapper = '<div id="custom-address-modal-wrapper"></div>';
    $('body').prepend(customAddressModalWrapper);
    //  Load Modal HTML into wrapper
    $('#custom-address-modal-wrapper').load(STPH_addressAutoComplete.customAddressModalUrl, function() {
      //  Add language Strings
      var modal = $('#custom-address-modal');      
      modal.find('.modal-title').text(STPH_addressAutoComplete.lang.cam_title);
      modal.find('label[for=custom-street]').text(STPH_addressAutoComplete.lang.cam_field_street);
      modal.find('label[for=custom-number]').text(STPH_addressAutoComplete.lang.cam_field_number);
      modal.find('label[for=custom-city]').text(STPH_addressAutoComplete.lang.cam_field_city);
      modal.find('label[for=custom-code]').text(STPH_addressAutoComplete.lang.cam_field_code);
      modal.find('label[for=custom-country]').text(STPH_addressAutoComplete.lang.cam_field_country);
      modal.find('label[for=custom-note]').text(STPH_addressAutoComplete.lang.cam_field_add_note);

      //  Add event listener
      $('#custom-address-form').on('submit', function(event) {
        event.preventDefault();
        var street = $('#custom-street').val();
        var number = $('#custom-number').val();
        var code = $('#custom-code').val();
        var city = $('#custom-city').val();
        var country = $('#custom-country').val();
        var note = $('#custom-note').val();
        
        var customAddress = street + " " + number + ", " + city + " " + code + "-" + country + " " + note;

        // Save into fields if enabled
        if(STPH_addressAutoComplete.advancedSave)
        {
          var as_data = { street: street, number:  number, code: code, city: city, country: country, note: note};
          STPH_addressAutoComplete.handleAdvancedSave(as_data);
        }
                
        var ui = {};
        ui.item = customAddress;
        STPH_addressAutoComplete.setState("is-custom", ui);        
        target_field.val(customAddress);
        $('#custom-address-modal').modal('hide');

      });

    });
  }
    
  //  Set Target of Address Auto Complete Input
  var target_aac = $('#'+STPH_addressAutoComplete.target_field+'-tr').find('input#address-auto-complete-'+STPH_addressAutoComplete.target_field);

  //  Pre-Populate Auto-Complete if there is allready a value for target field
  if(target_field.val().length> 0) {
  
    var ui = {};
    var item = {};
    item.label = target_field.val(); 
    ui.item = item;

    STPH_addressAutoComplete.setState( "is-valid", ui );

  }


  //  Register Event Listener: Input
  target_aac.on("input", function(){

    //  Reset on empty
    if( $(this).val() == "") {
      STPH_addressAutoComplete.setState( "default" );
    }

  });

  //  Register Event Listener: Focusout
  target_aac.on("focusout", function(e){

    if (e.relatedTarget && $(e.relatedTarget).hasClass('no-focus-out')) {
      return;
    }

    //  Notify user if selection has not been processed and set back to initial value!
    if($(this).val() != target_field.val() && target_field.val() != "") {
      STPH_addressAutoComplete-log("Value has not been changed.")
    }

    if($(this).val() != target_field.val() && target_field.val() == "") {
      $(this).val("");
      STPH_addressAutoComplete.setState( "default" );
      STPH_addressAutoComplete.log("No selection has been made. Restoring default..")
      //alert(STPH_addressAutoComplete.lang.alert_no_selection);
    }
    
  })

  //  Register Autocomplete 
  target_aac.autocomplete({

    //  Start search after min length
    minLength: 5,

    //  Set Source from external REST API
    source: function(request, response) {

      var full_url = STPH_addressAutoComplete.endpoint_url + request.term + STPH_addressAutoComplete.url_params + "&ref=redcap-address-auto-complete";

      $.ajax({
        dataType: "json",
        url: full_url,
        success: function(data){          

          STPH_addressAutoComplete.log("Results have been fetched.")
          
          //  Mapping Request to REDCap backend
          var backend = STPH_addressAutoComplete.requestHandlerUrl + "&action=mapResults";        
          $.post(backend, {
            source: STPH_addressAutoComplete.source_identifier,
            results: JSON.stringify(Object.values(data)[0])
          })
          .done(function(mappedData){
            STPH_addressAutoComplete.log("Data has been mapped.")
            response(mappedData)
          })
          .fail(function(err){
            STPH_addressAutoComplete.log("Data could not be mapped.")
            console.log(err.responseText)
          });            
  
        }
      });
      
    },    

    open: function() {

      //  Add footer on open
      var list = $('.ui-menu.ui-autocomplete');
      var width = list.outerWidth();
      var left = list.position().left;
      var top = list.position().top + list.outerHeight();
      //  Get API Source Logo
      var base64img = '';
      if(STPH_addressAutoComplete.base64_logo) {
        base64img = '<image style="margin-right:5px;" src="data:image/svg+xml;base64,' + STPH_addressAutoComplete.base64_logo + '" alt="api-logo" width="10">';
      }
      
      $('<div style="left:'+left+'px;top:'+top +'px;width:'+width+'px;" class="aac-list-footer">'+ base64img +STPH_addressAutoComplete.source_identifier+'</div>').insertAfter(list);

      STPH_addressAutoComplete.log("Auto-Complete list opened.")

    },

    close: function(event,ui) {
      STPH_addressAutoComplete.log("Auto-Complete list closed.")
      //  Remove footer on close
      $(".aac-list-footer").remove();
    },

    search: function(event, ui) { 
      STPH_addressAutoComplete.log("Search has been initiated..")
      //  Add loading indicator on search
      STPH_addressAutoComplete.setState(
        "is-loading"
      );
    },

    response: function(event, ui){
      STPH_addressAutoComplete.log("Response is beeing listed..")
      //  Add listing indicator on response
      STPH_addressAutoComplete.setState( 
        "is-listing",
        ui
      );
    },
    
    select: function( event, ui ) {
      //  Add validation indicator on select
      STPH_addressAutoComplete.setState(
        "is-valid", 
        ui
      );
      
      //  Set target field to label value
      target_field.val(ui.item.label);

      //  Check if secondary action is needed and process advanced save & meta fields over additional api call
      if(STPH_addressAutoComplete.hasSecondaryAction === true) {

        STPH_addressAutoComplete.log("Secondary Action needed. Performing Request with id " + ui.item.meta.id)

        STPH_addressAutoComplete.performSecondaryAction(ui.item.meta.id)
        .then( (ui_s) => {
          
          //  Save meta data
          target_meta.val(ui.item.meta.id + ", " + ui_s.y + ", " + ui_s.x)

          //  If advanced save is enabled save parts as well
          if(STPH_addressAutoComplete.advancedSave) {
            var as_data = { street: ui_s.street, number:  ui_s.number, code: ui_s.code, city: ui_s.city, country: "", note: ""};
            STPH_addressAutoComplete.handleAdvancedSave(as_data);
          }

          STPH_addressAutoComplete.log("A valid address has been selected. Meta and Field has been set.")

        });
      } else {
        
        //  Save meta data
        target_meta.val(ui.item.meta.id + ", " + ui.item.meta.y + ", " + ui.item.meta.x)        

        //  If advanced save is enabled save parts as well
        if(STPH_addressAutoComplete.advancedSave) {
          var as_data = { street: ui.item.parts.street, number:  ui.item.parts.number, code: ui.item.parts.code, city: ui.item.parts.city, country: "", note: ""};
          STPH_addressAutoComplete.handleAdvancedSave(as_data);
        }
        
        STPH_addressAutoComplete.log("A valid address has been selected. Meta and Field has been set.")

      }
    }
  });

}

STPH_addressAutoComplete.setState = function(state, ui=null) {

  var aac_input = $('#'+STPH_addressAutoComplete.target_field+'-tr').find('input#address-auto-complete-'+STPH_addressAutoComplete.target_field);
  var aac_status = $('#aac-status');
  var aac_selection = $('#aac-selection');

  if(state == "default") {

    aac_status.text(STPH_addressAutoComplete.lang.aac_status_default);
    aac_selection.html("");
    $('#aac-meta').hide();

    aac_input.removeClass("is-valid is-not-listed is-listed");
  }

  if(state == "is-loading") {
   
    aac_status.text(STPH_addressAutoComplete.lang.aac_status_is_loading);
    aac_input.removeClass("is-not-listed is-listed is-valid").addClass("is-loading");

  }

  if(state == "is-listing") {

    aac_input.removeClass("is-loading is-listed is-not-listed");

    if(ui.content == null) {
      aac_input.addClass("is-not-listed");
      var content;
      if(STPH_addressAutoComplete.customAddress) {
        content  = STPH_addressAutoComplete.lang.aac_status_is_not_listed_ca + '<a style="" onclick="STPH_addressAutoComplete.addCustomAddress()" class="no-focus-out" id="aac-custom-address-btn" href="#add-custom-address">Custom Address</a>';
      } else {
        content = STPH_addressAutoComplete.lang.aac_status_is_not_listed;
      }

      aac_status.html(content);
      STPH_addressAutoComplete.log("Nothing found.")
    } else if(ui.content.length > 0) {
      aac_input.addClass("is-listed");
      aac_status.text(STPH_addressAutoComplete.lang.aac_status_is_listed);
      STPH_addressAutoComplete.log("Something found.")
    }
  }

  if(state == "is-valid") {

    //aac_input.autocomplete("disable");
    aac_input.prop("disabled", true);

    var item = ui.item;
    aac_status.html(STPH_addressAutoComplete.lang.aac_status_is_valid + '<a onclick="STPH_addressAutoComplete.resetFields()" class="aac-reset-btn" href="#reset-selected-address">'+STPH_addressAutoComplete.lang.aac_reset_address+'</a>');
    aac_selection.html('<i>' +  item.label + '</i>');
    //$('#aac-meta-preview').text("id  = " + item.meta.id + " x = " + item.meta.x + " y = "+ item.meta.y);   
    //$('#aac-meta').show();
    aac_input.removeClass("is-not-listed is-listed").addClass("is-valid");

  }

  if(state == "is-custom") {
    aac_input.prop("disabled", true);
    aac_input.val(ui.item);
    aac_selection.html('<i>' +  ui.item + '</i>');
    aac_input.removeClass("is-not-listed is-listed").addClass("is-valid");
    aac_status.html(STPH_addressAutoComplete.lang.aac_status_is_custom + '<a onclick="STPH_addressAutoComplete.addCustomAddress()" class="no-focus-out" id="aac-custom-address-btn" href="#add-custom-address">' + STPH_addressAutoComplete.lang.cam_title +'</a>' + '<a style="margin-right:5px!important;" onclick="STPH_addressAutoComplete.resetFields()" class="aac-reset-btn" href="#reset-selected-address">'+STPH_addressAutoComplete.lang.aac_reset_address+'</a>');

  }

}

STPH_addressAutoComplete.resetFields = function() {
  var target_field = $('#'+STPH_addressAutoComplete.target_field+'-tr').find('input');
  var target_meta = $('#'+STPH_addressAutoComplete.target_meta+'-tr').find('input');
  var target_aac = $('#'+STPH_addressAutoComplete.target_field+'-tr').find('input#address-auto-complete-'+STPH_addressAutoComplete.target_field);
  
  target_aac.val("");
  target_aac.prop("disabled", false);
  target_aac.autocomplete("enable");

  target_field.val("");
  target_meta.val("");

  if(STPH_addressAutoComplete.advancedSave) {
    var as_data = { street: "", number:  "", code: "", city: "", country: "", note: ""};
    STPH_addressAutoComplete.handleAdvancedSave(as_data);
  }

  STPH_addressAutoComplete.setState( "default");
  target_aac.focus();

  STPH_addressAutoComplete.log("Fields have been reset.");
}

STPH_addressAutoComplete.addCustomAddress = function() {
  $('#custom-address-modal').modal('show');
  STPH_addressAutoComplete.log("Trigger Modal to add custom address here..");
}

STPH_addressAutoComplete.handleAdvancedSave = function(data) {

  //  Define targets
  var save_street = $('#'+STPH_addressAutoComplete.target_advanced.street+'-tr').find('input');
  var save_number = $('#'+STPH_addressAutoComplete.target_advanced.number+'-tr').find('input');
  var save_code = $('#'+STPH_addressAutoComplete.target_advanced.code+'-tr').find('input');
  var save_city = $('#'+STPH_addressAutoComplete.target_advanced.city+'-tr').find('input');
  var save_country = $('#'+STPH_addressAutoComplete.target_advanced.country+'-tr').find('input');
  var save_note = $('#'+STPH_addressAutoComplete.target_advanced.note+'-tr').find('input');

  save_street.val(data.street);
  save_number.val(data.number);
  save_code.val(data.code);
  save_city.val(data.city);
  save_country.val(data.country);
  save_note.val(data.note);

}