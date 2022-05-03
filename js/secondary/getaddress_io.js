STPH_addressAutoComplete.performSecondaryAction = function(id) {

    return new Promise((resolve, reject) => {

        var api = STPH_addressAutoComplete.configuration.api;
        var secondary_url = api.url_base + "/get/" + id + api.url_params + "&ref=redcap-address-auto-complete";
        
        $.ajax({
            url: secondary_url,
            success: function(data){                
                //  Adjust format here.
                var response = {
                    street: data.thoroughfare, 
                    number: data.building_number, 
                    code: data.postcode, 
                    city: data.town_or_city,
                    x: data.longitude,
                    y: data.latitude
                };

                resolve(response)
            },
            error: function (error) {
                reject(error)
            },
        })

    })
}