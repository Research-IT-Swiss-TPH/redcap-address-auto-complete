<?php

// Set the namespace defined in your config file
namespace STPH\addressAutoComplete;

use \REDCap;

if( file_exists("vendor/autoload.php") ){
    require 'vendor/autoload.php';
}

// Declare your module class, which must extend AbstractExternalModule 
class addressAutoComplete extends \ExternalModules\AbstractExternalModule {

    private $moduleName = "Address Auto Complete"; 
    private $target;
    private $lang;

   /**
    * Constructs the class
    *
    */
    public function __construct()
    {        
        parent::__construct();
       // Other code to run when object is instantiated
    }

   /**
    * Hooks Address Auto Complete module to redcap_every_page_top
    *
    */
    public function redcap_every_page_top($project_id = null) {

        $target_name = $this->getProjectSetting("target-field");
        $target_type = REDCap::getFieldType($target);
        $this->target = $target_name;


        if($this->isPage("DataEntry/index.php")) {
            $this->setLanguageStrings();
            $this->includeJavascript();
            $this->includeCSS();
        }

        //$this->renderModule();
    }

   /**
    * Renders the module
    *
    * @since 1.0.0
    */
    private function renderModule() {
        
        $this->includeJavascript();              
        $this->includeCSS();


    }

    private function setLanguageStrings() {

        $this->lang = array(
            "aac_status_default" => $this->tt("aac_status_default"),
            "aac_status_is_loading" => $this->tt("aac_status_is_loading"),
            "aac_status_is_not_listed" => $this->tt("aac_status_is_not_listed"),
            "aac_status_is_listed" => $this->tt("aac_status_is_listed"),
            "aac_status_is_valid" => $this->tt("aac_status_is_valid"),
            "alert_no_selection" => $this->tt("alert_no_selection")
        );

    }

    /**
    * Returns a test string including module name.
    *
    * @since 1.0.0
    */    
    public function helloFrom_addressAutoComplete() {

        
        $targetField = $this->getProjectSetting("target-field");

        return $targetField;

        //return $this->tt("hello_from").' '.$this->moduleName;
        

    }

    
   /**
    * Include JavaScript files
    *
    * @since 1.0.0
    */
    private function includeJavascript() {
        ?>
        <script src="<?php print $this->getUrl('js/main.js'); ?>"></script>
        <script> 
            $(function() {
                $(document).ready(function(){
                    STPH_addressAutoComplete.target = '<?= $this->target ?>';
                    STPH_addressAutoComplete.lang = <?php print json_encode($this->lang) ?>;
                    STPH_addressAutoComplete.init();
                })
            });
        </script>
        <?php
    }
    

    
   /**
    * Include Style files
    *
    * @since 1.0.0    
    */
    private function includeCSS() {
        ?>
        <link rel="stylesheet" href="<?= $this->getUrl('style.css')?>">
        <?php
    }
    
}