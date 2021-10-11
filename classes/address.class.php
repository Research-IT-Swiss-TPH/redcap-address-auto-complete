<?php
namespace STPH\addressAutoComplete;

if (!class_exists("meta")) require_once("meta.class.php");
if (!class_exists("parts")) require_once("parts.class.php");

class address {
    public $label;
    public $value;
    public $parts;
    public $meta;

    public function __construct() {
        $this->meta = new meta;
        $this->parts = new parts;
        $this->label = "";
        $this->value = "";
    }

}