STPH_addressAutoComplete.performSecondaryAction = function(id) {

    return new Promise((resolve, reject) => {

        secondary_url = STPH_addressAutoComplete.base_url + "/get/" + id + STPH_addressAutoComplete.url_params + "&ref=redcap-address-auto-complete";
        
        $.ajax({
            url: secondary_url,
            success: function(data){
                console.log(data)
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