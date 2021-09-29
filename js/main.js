/**
 * Address Auto Complete - a REDCap External Module
 * Author: Ekin Tertemiz
*/

var STPH_addressAutoComplete = STPH_addressAutoComplete || {};

// Initialization
STPH_addressAutoComplete.init = function() {


    console.log("Address auto-complete module has been initialized");
    console.log("Field transformed: " + STPH_addressAutoComplete.target);


    var target_input = $('#'+STPH_addressAutoComplete.target+'-tr').find('input');
    //  Hide original input
    target_input.hide();

    //  Add Addres Auto Complete Input
    var autoCompleteInput = '<div style="padding-right:10%;" class="input-group mb-3 mt-3"><div class="input-group-prepend"><span class="input-group-text" id="basic-addon1"><i class="fas fa-map-marker-alt"></i></span></div><input id="address-auto-complete-' + STPH_addressAutoComplete.target + '" type="text" class="form-control address-auto-complete-input is-not-listed" placeholder="" aria-label="Address" aria-describedby="basic-addon1"><small id="autoCompleteHelp" class="form-text text-muted"><span id="aac-status">Start typing the location to begin.</span><br><span id="aac-meta">Meta: <span id="aac-meta-preview"></span></span></small></div>';
    target_input.parent().prepend(autoCompleteInput);
    
    //  Target new input
    var target_input_aac = $('#'+STPH_addressAutoComplete.target+'-tr').find('input#address-auto-complete-'+STPH_addressAutoComplete.target);

    target_input_aac.on("change", function(){
      console.log($(this).val());
    })


     // Auto-Complete with API as Source
     target_input_aac.autocomplete({
      
      source: function(request, response) {

        var geo_api_url = "http://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&origins=address&limit=20&searchText=";
        //var searchText = "Socinstrasse";


        $.getJSON( geo_api_url + request.term, {}, function(data){
          //  Map Results
          var mappedResults = STPH_addressAutoComplete.mapResults(data.results)
          console.log(mappedResults);
          response(mappedResults);
        });

      },
      minLength: 5,
      select: function( event, ui ) {
        var meta = ui.item.meta;
        console.log(ui.item.meta);
        $('#aac-status').html('<i>' +  ui.item.label + '</i>');
        $('#aac-meta-preview').html("id  = " + meta.id + " x = " + meta.x + " y = "+ meta.y);
        $('#aac-meta').show();
        target_input_aac.removeClass("is-not-listed").addClass("is-valid");
      }

    });

    //  Set Session Storage
    //STPH_addressAutoComplete.setSessionStorage();
    
    //  Transform into Autocomplete field
    //STPH_addressAutoComplete.transformToAutoCompleteField(target_input_aac);

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

STPH_addressAutoComplete.transformToAutoCompleteField = function(target) {

    target.autocomplete({
      source: JSON.parse( sessionStorage.getItem('availableTags') )
    });
}



STPH_addressAutoComplete.setSessionStorage = function () {

  var availableTags = [
    "ActionScript",
    "AppleScript",
    "Asp",
    "BASIC",
    "C",
    "C++",
    "Clojure",
    "COBOL",
    "ColdFusion",
    "Erlang",
    "Fortran",
    "Groovy",
    "Haskell",
    "Java",
    "JavaScript",
    "Lisp",
    "Perl",
    "PHP",
    "Python",
    "Ruby",
    "Scala",
    "Scheme"
  ];

  sessionStorage.setItem('availableTags', JSON.stringify(availableTags));

}