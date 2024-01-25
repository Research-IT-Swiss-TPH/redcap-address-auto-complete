<?php
namespace STPH\addressAutoComplete;

if (!class_exists("source")) require_once( __DIR__ . "/../classes/source.class.php" );

class geo_admin_ch extends source {

    public function mapAddress($value) {
    
        $address = new Address;
        
        //  The API returns a string in the format STREET NO, <b>CODE PLACE</b>
        //  The following string transformation are used to get the isolated address parts
        $l = $value->attrs->label;

        //  Feature Id is equivalent to egid_edid and has been added per request instead of address_id
        $feature_id = $value->attrs->featureId;

        $l_sn = strip_tags(substr($l, 0, strpos($l, "<") - 1));

        $address->parts->street = substr($l_sn, 0, strcspn( $l_sn , '0123456789' ) - 1);
        $address->parts->number = substr($l_sn, strcspn( $l_sn , '0123456789' ), strlen($l_sn) - strcspn( $l_sn , '0123456789' ));

        $l_cp = strip_tags(substr($l, strpos($l, "<"), strlen($l) - strpos($l, ">")));

        $address->parts->code = substr($l_cp, 0, strpos($l_cp, " "));
        $address->parts->city = substr($l_cp, strpos($l_cp, " ") + 1, strlen($l_cp) - strpos($l_cp, " "));

        //  Meta information that are important for enabling data analysis and keeping data consistency
        $address->meta->x = $value->attrs->x;
        $address->meta->y = $value->attrs->y;
        $address->meta->id = $feature_id;

        return $address;       

    }
    
}