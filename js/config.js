// This script is loaded on module configuration page only.

$("select[name=api-source]").on("change", function(){
    
    var api_description_wrapper = $("#api-description-wrapper");

    var source = $(this).find("option:selected").text();
    var url = api_description_wrapper.data("url");
    var pid = api_description_wrapper.data("pid");

    $.post(url + '&action=getConfigDescription', {
        source: source,
        pid: pid
    }).done(function(data) {
        api_description_wrapper.html(data.html);
    }).fail(function(err){
        console.log(err.responseText);
    });
    
})
