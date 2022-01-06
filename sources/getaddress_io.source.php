<?php
namespace STPH\addressAutoComplete;

if (!class_exists("source")) require_once( __DIR__ . "./../classes/source.class.php" );

class getaddress_io extends source {

    public function mapAddress($value) {
    
        $address = new Address;
        
        //  The API returns a string in the format
        //  "The Westminster, 12 Westminster Street, Yeovil, Somerset"
        //  %LINE_1%, %LINE_2%,, %TOWN_OR_CITY%, %COUNTY%
        
        //  Set label and value to given address
        $address->label = $value->address;
        $address->value = $value->address;

        //  Since the API is not fully public and additional infor such as meta data has to be fetched by a 
        //  secondary action we will leave all fields empty (null) except id which will be used to fetch more data
        
        $address->parts->street = null;
        $address->parts->number = null;

        $address->parts->code = null;
        $address->parts->city = null;

        $address->meta->x = null;
        $address->meta->y = null;
        $address->meta->id = $value->id;

        return $address;       

    }
    
}