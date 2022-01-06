<?php
namespace STPH\addressAutoComplete;

if (!class_exists("Address")) require_once("address.class.php");

abstract class Source {

    protected $data;
    protected $format;
    protected $mappedResults;

    public function __construct($data, $format=null) {
        $this->data = $data;
        $this->format = $format;
        $this->mapResults();
    }

    abstract protected function mapAddress($value);

    private function mapResults() {

        foreach ($this->data as $key => $value) {

            $mappedAddress = $this->mapAddress($value);

            if (!$mappedAddress instanceof Address) {
                throw new \Exception("Cannot map results! Method 'mapAddress' must return instance of class 'Address'!");
            }

            //  Format output label and value if not yet set (in case there is no secondary action for this source)
            if($mappedAddress->label == "") {
                $mappedAddress->label = $this->formatLabel($mappedAddress);
                $mappedAddress->value = $mappedAddress->label;
            }
            
            $this->mappedResults[$key] = $mappedAddress;

        }

    }

    private function formatLabel(Address $address) {

        if(!empty($this->format)) {
            $label =$this->format;
            $label = str_ireplace("%street%", $address->parts->street, $label);
            $label = str_ireplace("%number%", $address->parts->number, $label);
            $label = str_ireplace("%code%", $address->parts->code, $label);
            $label = str_ireplace("%city%", $address->parts->city, $label);
        }

        else {
            $label = $address->parts->street . " " . $address->parts->number . ", " . $address->parts->code . " " . $address->parts->city;
        }

        return $label;

    }

    public function getMappedResults() {
        return $this->mappedResults;        
    }

}