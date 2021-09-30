/**
 * Address Auto Complete - a REDCap External Module
 * Author: Ekin Tertemiz
*/

var STPH_addressAutoComplete = STPH_addressAutoComplete || {};

// Initialization
STPH_addressAutoComplete.init = function() {

  console.log("Address auto-complete module has been initialized");

  var target_input = $('#'+STPH_addressAutoComplete.target+'-tr').find('input');
  target_input.hide();

  //  Add Addres Auto Complete Input Markdown
  var autoCompleteInput = '<small id="accStatusHelper" class="form-text text-muted mb-1 mt-3"><span id="aac-status">'+ STPH_addressAutoComplete.lang.aac_status_default +'</span></small></small><div style="padding-right:10%;" class="input-group mb-3"><div class="input-group-prepend"><span class="input-group-text" id="basic-addon1"><i class="fas fa-map-marker-alt"></i></span></div><input value="'+target_input.val()+'" id="address-auto-complete-' + STPH_addressAutoComplete.target + '" type="text" class="form-control address-auto-complete-input" placeholder="" aria-label="Address" aria-describedby="basic-addon1"><small id="autoCompleteHelp" class="form-text text-muted"><span id="aac-selection"></span><br><span id="aac-meta">Meta: <span id="aac-meta-preview"></span></span></small></div>';
  target_input.parent().prepend(autoCompleteInput);
    
  //  Set Target of Address Auto Complete Input
  var target_input_aac = $('#'+STPH_addressAutoComplete.target+'-tr').find('input#address-auto-complete-'+STPH_addressAutoComplete.target);

  //  Pre-Populate if there is a value
  if(target_input.val().length> 0) {
  
    var ui = {};
    var item = {};
    item.label = target_input.val(); 
    var meta = {};    
    meta.id = 1;
    meta.x = 2;
    meta.y = 3;

    item.meta = meta;
    ui.item = item;

    STPH_addressAutoComplete.set_aac_status( target_input_aac, "is-valid", ui );

  }


  //  Register Event Listener: Input
  target_input_aac.on("input", function(){

    //  Reset on empty
    if( $(this).val() == "") {
      STPH_addressAutoComplete.set_aac_status( $(this), "default" );
    }

  });

  //  Register Event Listener: Focusout
  target_input_aac.on("focusout", function(){

    //  Notify user if selection has not been processed and set back to initial value!
    if($(this).val() != target_input.val() && target_input.val() != "") {
      console.log("not same");
    }

    if($(this).val() != target_input.val() && target_input.val() == "") {
      $(this).val("");
      STPH_addressAutoComplete.set_aac_status( $(this), "default" );
      alert(STPH_addressAutoComplete.lang.alert_no_selection);
    }
    //console.log(sessionStorage.getItem("aac-label"));
  })

  //  Register Autocomplete 
  target_input_aac.autocomplete({

    //  Start search after min length
    minLength: 5,

    //  Set Source from external REST API
    source: function(request, response) {

      //  Docs: http://api3.geo.admin.ch/services/sdiservices.html#search
      var base_url = "http://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&origins=address&limit=20&searchText=";
      var full_url = base_url + request.term;
      
      $.getJSON( full_url, {}, function(data){
        //  Map Results
        var mappedResults = STPH_addressAutoComplete.mapResults(data.results);
        response(mappedResults);
      });

    },    

    open: function() {

      var that = $(this).data('ui-autocomplete');
      var list = $('#ui-id-'+that.menu.uuid);      
      var width = list.outerWidth();
      var height = list.outerHeight();
      var left = list.position().left;
      var top = list.position().top + list.outerHeight();

      console.log(top);
      console.log(height);
      console.log(top + height);

      var api_service_markup = '<svg width="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 604 669"><path fill="red" d="M302 2c100 0 200 17 300 50 0 234 2 482-300 615C0 534 2 286 2 52 102 19 202 2 302 2z"/><path fill="#fff" d="M102 242h140V102h120v140h140v120H362v140H242V362H102z"/></svg> geo.admin.ch';
      $('<div style="left:'+left+'px;top:'+top +'px;width:'+width+'px;" class="aac-list-footer">'+api_service_markup+'</div>').insertAfter(list);

    },

    close: function(event,ui) {
      $(".aac-list-footer").remove();
    },

    //  Set Search Actions
    search: function(event, ui) { 

      STPH_addressAutoComplete.set_aac_status(
        $(this), 
        "is-loading"
      );
    },

    //  Set Response Actions
    response: function(event, ui){

      STPH_addressAutoComplete.set_aac_status( 
        $(this), 
        "is-listing",
        ui
      );
    },
    
    //  Set Select Actions
    select: function( event, ui ) {

      STPH_addressAutoComplete.set_aac_status(
        target_input_aac, 
        "is-valid", 
        ui
      );
      target_input.val(ui.item.label);
    }

  });

}

STPH_addressAutoComplete.set_aac_status = function(target, status, ui=null) {

  var aac_input = $('#'+STPH_addressAutoComplete.target+'-tr').find('input#address-auto-complete-'+STPH_addressAutoComplete.target);
  var aac_status = $('#aac-status');
  var aac_selection = $('#aac-selection');

  if(status == "default") {

    aac_status.text(STPH_addressAutoComplete.lang.aac_status_default);
    aac_selection.html("");
    $('#aac-meta').hide();

    target.removeClass("is-valid is-not-listed is-listed");
    sessionStorage.removeItem("aac-label");

  }

  if(status == "is-loading") {
   
    aac_status.text(STPH_addressAutoComplete.lang.aac_status_is_loading);

    target.removeClass("is-not-listed is-valid");
    target.addClass("is-loading");


  }

  if(status == "is-listing") {

    target.removeClass("is-loading is-listed is-not-listed");

    var content = ui.content;
    if(content.length > 0) {    
      target.addClass("is-listed");

    } else {
      
      target.addClass("is-not-listed");
      aac_status.text(STPH_addressAutoComplete.lang.aac_status_is_not_listed);
    }


  }

  if(status == "is-valid") {

    //aac_input.autocomplete("disable");
    aac_input.prop("disabled", true);

    var item = ui.item;
    aac_status.html(STPH_addressAutoComplete.lang.aac_status_is_valid + '<a onclick="STPH_addressAutoComplete.resetAAC(STPH_addressAutoComplete.target)" class="aac-reset-btn" href="#reset-selected-address">Reset Address</a>');
    aac_selection.html('<i>' +  item.label + '</i>');
    $('#aac-meta-preview').text("id  = " + item.meta.id + " x = " + item.meta.x + " y = "+ item.meta.y);   
    $('#aac-meta').show();

    target.removeClass("is-not-listed is-listed").addClass("is-valid");
    sessionStorage.setItem('aac-label', item.label);
  }

}

STPH_addressAutoComplete.resetAAC = function(target) {
  var target_input = $('#'+target+'-tr').find('input');
  var target_input_aac = $('#'+target+'-tr').find('input#address-auto-complete-'+target);
  target_input_aac.val("");
  target_input.val("");
  target_input_aac.prop("disabled", false);
  target_input_aac.autocomplete("enable");

  STPH_addressAutoComplete.set_aac_status(target_input_aac, "default");
  target_input_aac.focus();
}

STPH_addressAutoComplete.mapResults = function(results) {
  
  return results.map( (obj) => {

    var rObj = {};

    //  Prepare label
    var label_plain = obj.attrs.label.replaceAll(/(<([^>]+)>)/ig, "");
    var pos_1 = label_plain.indexOf(" ");
    var label_street = label_plain.substr(0, pos_1);
    var pos_2 = pos_1 + label_plain.substr(pos_1 + 1).indexOf(" ");
    var label_num = label_plain.substr(pos_1, pos_2 - pos_1 + 1);
    var label_city = label_plain.substr(pos_2 + 1);

    var label = label_street + label_num + "," + label_city + ", CH";
   
    rObj.label = label;
    rObj.value = label;

    var metaObj= {};
    metaObj.x = obj.attrs.x;
    metaObj.y = obj.attrs.y;
    metaObj.id = obj.id;

    rObj.meta = metaObj;


    return rObj;

  });    
}