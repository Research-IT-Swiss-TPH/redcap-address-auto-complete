/**
 * Address Auto Complete - a REDCap External Module
 * Author: Ekin Tertemiz
*/

var STPH_addressAutoComplete = STPH_addressAutoComplete || {};

// Debug logging
STPH_addressAutoComplete.log = function() {
  if (STPH_addressAutoComplete.configuration.options.enable_debug) {
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

  var instructions = STPH_addressAutoComplete.instructions
  instructions.forEach(function(instruction) {

    //  Instruction IDs
    var iid = {
      f: instruction.target_field,
      m: instruction.target_meta,
      a: instruction.advanced_fields,
      t: instruction.timestamp_field
    };

    var target_field = $('#'+iid.f+'-tr').find('input');
    var target_meta  = $('#'+iid.m+'-tr').find('input');
    var timestamp_field = $('#'+iid.t+'-tr').find('input');

    //  Check if field exists on current form/survey
    if(target_field.length > 0) {
        
      //  Hide original field
      target_field.hide();

      // Define needed variables
      var lang = STPH_addressAutoComplete.language;
      var conf = STPH_addressAutoComplete.configuration;
      var help = STPH_addressAutoComplete.helpers;

      //  Add Address Auto Complete Input Markdown 
      var autoCompleteInput = '<small id="accStatusHelper-'+iid.f+'" class="form-text text-muted mb-1 mt-3"><span id="aac-status-'+iid.f+'">'+ lang.aac_status_default +'</span></small></small><div style="padding-right:10%;" class="input-group mb-3"><div class="input-group-prepend"><span class="input-group-text" id="basic-addon1-'+iid.f+'"><i class="fas fa-map-marker-alt"></i></span></div><input value="'+target_field.val()+'" id="address-auto-complete-' + iid.f + '" type="text" class="form-control address-auto-complete-input" placeholder="" aria-label="Address" aria-describedby="basic-addon1"><small id="autoCompleteHelp-'+iid.f+'" class="form-text text-muted"><span id="aac-selection-'+iid.f+'"></span><br><span class="aac-meta" id="aac-meta-'+iid.f+'">Meta: <span id="aac-meta-preview-'+iid.f+'"></span></span></small></div>';     
      target_field.parent().prepend(autoCompleteInput);

      //  Add Custom Address Modal Markdown (if enabled)
      if(conf.options.enable_custom_address) {

        var customAddressModalWrapper = '<div id="custom-address-modal-wrapper-'+iid.f+'"></div>';
        $('body').prepend(customAddressModalWrapper);
        //  Load Modal HTML into wrapper
        $('#custom-address-modal-wrapper-'+iid.f+'').load(help.url_custom_address_modal, function() {
          //  Add language Strings
          var modal = $('#custom-address-modal-wrapper-'+iid.f+' #custom-address-modal');
          modal.find('.modal-title').text(lang.cam_title);
          modal.find('label[for=custom-street]').text(lang.cam_field_street);
          modal.find('label[for=custom-number]').text(lang.cam_field_number);
          modal.find('label[for=custom-city]').text(lang.cam_field_city);
          modal.find('label[for=custom-code]').text(lang.cam_field_code);
          modal.find('label[for=custom-country]').text(lang.cam_field_country);
          modal.find('label[for=custom-note]').text(lang.cam_field_add_note);
    
          //  Add event listener
          $('#custom-address-modal-wrapper-'+iid.f+' #custom-address-modal .custom-address-form').on('submit', function(event) {
            event.preventDefault();
            var street = $('#custom-address-modal-wrapper-'+iid.f+' #custom-street').val();
            var number = $('#custom-address-modal-wrapper-'+iid.f+' #custom-number').val();
            var code = $('#custom-address-modal-wrapper-'+iid.f+' #custom-code').val();
            var city = $('#custom-address-modal-wrapper-'+iid.f+' #custom-city').val();
            var country = $('#custom-address-modal-wrapper-'+iid.f+' #custom-country').val();
            var note = $('#custom-address-modal-wrapper-'+iid.f+' #custom-note').val();
            
            var customAddress = street + " " + number + ", " + city + " " + code + "-" + country + " " + note;
    
            // Save into fields if enabled
            if(conf.options.enable_advanced_save)
            {
              var as_data = { street: street, number:  number, code: code, city: city, country: country, note: note};
              STPH_addressAutoComplete.handleAdvancedSave(as_data, iid.a);
            }
                    
            var ui = {};
            ui.item = customAddress;
            STPH_addressAutoComplete.setState("is-custom", iid, ui);        
            target_field.val(customAddress);
            $('#custom-address-modal-wrapper-'+iid.f+' #custom-address-modal').modal('hide');
    
          });
    
        });
      }

      //  Set Target of Address Auto Complete Input
      var target_aac = $('#'+iid.f+'-tr').find('input#address-auto-complete-'+iid.f);

      //  Pre-Populate Auto-Complete if there is allready a value for target field
      if(target_field.val().length> 0) {     
        var ui = {};
        var item = {};
        item.label = target_field.val(); 
        ui.item = item;

        STPH_addressAutoComplete.setState( "is-valid", iid, ui );
      }

      //  Register Event Listener: Input
      target_aac.on("input", function(){

        //  Reset on empty
        if( $(this).val() == "") {
          STPH_addressAutoComplete.setState( "default", iid );
        }

      });

      //  Register Event Listener: Focusout
      target_aac.on("focusout", function(e){

        if (e.relatedTarget && $(e.relatedTarget).hasClass('no-focus-out')) {
          return;
        }

        //  Notify user if selection has not been processed and set back to initial value!
        if($(this).val() != target_field.val() && target_field.val() != "") {
          STPH_addressAutoComplete.log("Value has not been changed.")
        }

        if($(this).val() != target_field.val() && target_field.val() == "") {
          $(this).val("");
          STPH_addressAutoComplete.setState( "default", iid );
          STPH_addressAutoComplete.log("No selection has been made. Restoring default..")
          //alert(STPH_addressAutoComplete.lang.alert_no_selection);
        }
        
      })

      //  Register Autocomplete 
      var api = conf.api;

      target_aac.autocomplete({

        //  Start search after min length
        minLength: 5,

        //  Set Source from external REST API
        source: function(request, response) {

          $.ajax({
            dataType: "json",
            //  url = endpoint + search term + url params 
            url: api.url_endpoint + request.term + api.url_params + "&ref=redcap-address-auto-complete",

            success: function(data){          
              STPH_addressAutoComplete.log("Results have been fetched.")
              
              //  Mapping Request to REDCap backend or gateway
              var backend = help.url_request_handler + "&action=mapResults"
              if(help.is_survey_page) {
                backend = help.url_gateway;
              }

              $.post(backend, {
                session_id: help.session_id,
                survey_hash: help.survey_hash,
                source: api.source_identifier,
                results: JSON.stringify(Object.values(data)[0]),
                redcap_csrf_token: help.csrf_token
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
          if(api.base64_logo) {
            var base64img = '<image style="margin-right:5px;" src="data:image/svg+xml;base64,' + api.base64_logo + '" alt="api-logo" width="10">';
          }
          $('<div style="left:'+left+'px;top:'+top +'px;width:'+width+'px;" class="aac-list-footer">'+ base64img +api.source_identifier+'</div>').insertAfter(list);

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
          STPH_addressAutoComplete.setState( "is-loading",iid);
        },

        response: function(event, ui){
          STPH_addressAutoComplete.log("Response is beeing listed..")
          //  Add listing indicator on response
          STPH_addressAutoComplete.setState("is-listing",iid, ui);
        },
        
        select: function( event, ui ) {
          //  Add validation indicator on select
          STPH_addressAutoComplete.setState("is-valid", iid, ui);
          
          //  Set target field to label value
          target_field.val(ui.item.label);

          //  Check if secondary action is needed and process advanced save & meta fields over additional api call
          if(api.has_secondary_action === true) {

            STPH_addressAutoComplete.log("Secondary Action needed. Performing Request with id " + ui.item.meta.id)

            STPH_addressAutoComplete.performSecondaryAction(ui.item.meta.id)
            .then( (ui_s) => {
              
              //  Save meta data
              target_meta.val(ui.item.meta.id + ", " + ui_s.y + ", " + ui_s.x)            

              //  If advanced save is enabled save parts as well
              if(STPH_addressAutoComplete.configuration.options.enable_advanced_save) {
                var as_data = { street: ui_s.street, number:  ui_s.number, code: ui_s.code, city: ui_s.city, country: "", note: ""};
                STPH_addressAutoComplete.handleAdvancedSave(as_data, iid.a);
              }

              STPH_addressAutoComplete.log("A valid address has been selected. Meta and Field has been set.")

            });
          } else {
            
            //  Save meta data
            target_meta.val(ui.item.meta.id + ", " + ui.item.meta.y + ", " + ui.item.meta.x)        

            //  If advanced save is enabled save parts as well
            if(STPH_addressAutoComplete.configuration.options.enable_advanced_save) {
              var as_data = { street: ui.item.parts.street, number:  ui.item.parts.number, code: ui.item.parts.code, city: ui.item.parts.city, country: "", note: ""};
              STPH_addressAutoComplete.handleAdvancedSave(as_data, iid.a);
            }
            
            STPH_addressAutoComplete.log("A valid address has been selected. Meta and Field has been set.")
          }

          //  Save timestamp if it has been configured
          if(timestamp_field) {
            timestamp_field.val(new Date().toISOString().split('T')[0])
          }

        }
      });

    } else {
      STPH_addressAutoComplete.log("There are no Address auto-complete instructions for this form/survey. \nTerminating.");
    }
  });

}

STPH_addressAutoComplete.setState = function(state, iid, ui=null) {

  var lang = STPH_addressAutoComplete.language;

  var aac_input = $('#'+iid.f+'-tr').find('input#address-auto-complete-'+iid.f);
  var aac_status = $('#aac-status-'+iid.f);
  var aac_selection = $('#aac-selection-'+iid.f);

  if(state == "default") {

    aac_status.text(lang.aac_status_default);
    aac_selection.html("");
    $('#aac-meta-'+iid.f).hide();

    aac_input.removeClass("is-valid is-not-listed is-listed");
  }

  if(state == "is-loading") {
   
    aac_status.text(lang.aac_status_is_loading);
    aac_input.removeClass("is-not-listed is-listed is-valid").addClass("is-loading");

  }

  if(state == "is-listing") {

    aac_input.removeClass("is-loading is-listed is-not-listed");

    if(ui.content == null) {
      aac_input.addClass("is-not-listed");
      var content;
      if(STPH_addressAutoComplete.configuration.options.enable_custom_address) {
        content  = lang.aac_status_is_not_listed_ca + '<a style="" class="no-focus-out aac-custom-address-btn" id="aac-custom-address-btn-'+iid.f+'" href="#add-custom-address">Custom Address</a>';
      } else {
        content = lang.aac_status_is_not_listed;
      }

      aac_status.html(content);
      STPH_addressAutoComplete.log("Nothing found.")
    } else if(ui.content.length > 0) {
      aac_input.addClass("is-listed");
      aac_status.text(lang.aac_status_is_listed);
      STPH_addressAutoComplete.log("Something found.")
    }
  }

  if(state == "is-valid") {

    //aac_input.autocomplete("disable");
    aac_input.prop("disabled", true);

    var item = ui.item;
    aac_status.html(lang.aac_status_is_valid + '<a id="aac-reset-btn-'+iid.f+'" class="aac-reset-btn" href="#reset-selected-address">'+lang.aac_reset_address+'</a>');
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
    aac_status.html(lang.aac_status_is_custom + '<div id="custom-address-buttons"><a class="no-focus-out aac-custom-address-btn" id="aac-custom-address-btn-'+iid.f+'" href="#add-custom-address">' + lang.cam_title +'</a>' + '<a style="margin-right:5px!important;" id="aac-reset-btn-'+iid.f+'" class="aac-reset-btn" href="#reset-selected-address">'+lang.aac_reset_address+'</a>');

  }

  //  Register Additional Event Handlers
  //  Reset Fields
  $('#aac-reset-btn-'+iid.f).on('click', function() {
    STPH_addressAutoComplete.resetFields(iid);
  })

  //  Custom Address Modal
  $('#aac-custom-address-btn-'+iid.f).on('click', function(){
    STPH_addressAutoComplete.log("Trigger Modal to add custom address here..");
    $('#custom-address-modal-wrapper-'+iid.f+' #custom-address-modal').modal('show');
  });

}

STPH_addressAutoComplete.resetFields = function(iid) {
  
  var target_field = $('#'+iid.f+'-tr').find('input');
  var target_meta = $('#'+iid.m+'-tr').find('input');
  var target_aac = $('#'+iid.f+'-tr').find('input#address-auto-complete-'+iid.f);
  var timestamp_field = $('#'+iid.t+'-tr').find('input');
  
  target_aac.val("");
  target_aac.prop("disabled", false);
  target_aac.autocomplete("enable");

  target_field.val("");
  target_meta.val("");

  if(timestamp_field) {
    timestamp_field.val("");
  }

  if(STPH_addressAutoComplete.configuration.options.enable_advanced_save) {
    var as_data = { street: "", number:  "", code: "", city: "", country: "", note: ""};
    STPH_addressAutoComplete.handleAdvancedSave(as_data, iid.a);
  }

  STPH_addressAutoComplete.setState( "default", iid);
  target_aac.focus();

  STPH_addressAutoComplete.log("Fields have been reset.");
}

STPH_addressAutoComplete.handleAdvancedSave = function(data, advanced_fields) {

  //  Define targets
  var save_street = $('#'+advanced_fields.street+'-tr').find('input');
  var save_number = $('#'+advanced_fields.number+'-tr').find('input');
  var save_code = $('#'+advanced_fields.code+'-tr').find('input');
  var save_city = $('#'+advanced_fields.city+'-tr').find('input');
  var save_country = $('#'+advanced_fields.country+'-tr').find('input');
  var save_note = $('#'+advanced_fields.note+'-tr').find('input');

  save_street.val(data.street);
  save_number.val(data.number);
  save_code.val(data.code);
  save_city.val(data.city);
  save_country.val(data.country);
  save_note.val(data.note);

}