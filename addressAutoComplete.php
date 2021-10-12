<?php

// Set the namespace defined in your config file
namespace STPH\addressAutoComplete;

use \REDCap;

if( file_exists("vendor/autoload.php") ){
    require 'vendor/autoload.php';
}

// Declare your module class, which must extend AbstractExternalModule 
class addressAutoComplete extends \ExternalModules\AbstractExternalModule {

    private $api_source;
    private $api_config;
    private $api_logo;
    private $target_field;
    private $target_meta;
    private $lang;
    private $outputFormat;

    private $isEnabledForDataEntry;
    private $isEnabledForSurvey;

   /**
    * Constructs the class
    *
    */
    public function __construct()
    {        
        parent::__construct();
       // Other code to run when object is instantiated
       $this->api_source = "";
       $this->api_config = [];
       $this->target_field = "";
       $this->target_meta = "";
       $this->lang = [];
       $this->outputFormat = "";

       $this->isConfigInvalid = false;
       $this->isEnabledForDataEntry = false;
       $this->isEnabledForSurvey = false;
    }

   /**
    * Hooks Address Auto Complete module to redcap_every_page_top
    *
    */
    public function redcap_every_page_top($project_id = null) {      

        $this->setSettings();
       
        if($this->isPage("DataEntry/index.php") && $this->isEnabledForDataEntry) {
            $this->renderModule();
        }

    }

    function redcap_survey_page_top()  {
        
        if($this->isEnabledForSurvey) {
            $this->renderModule();
        }

    }

    private function setSettings() {

        //  Check if target field is of type text (also checks if field has been set)
        if( REDCap::getFieldType($this->getProjectSetting("target-field")) != "text") {
            return;
        }

        $this->api_source = $this->getProjectSetting("api-source");
        $this->api_limit = $this->getProjectSetting("api-limit");

        $this->api_config = $this->getSourceConfig();

        $this->target_field = $this->getProjectSetting("target-field");
        $this->target_meta = $this->getProjectSetting("target-meta");

        $this->isEnabledForDataEntry = $this->getProjectSetting("enable-for-data-entry");
        $this->isEnabledForSurvey = $this->getProjectSetting("enable-for-survey");

        $this->outputFormat = $this->getProjectSetting("output-format");

        $this->debug = $this->getProjectSetting("javascript-debug") == true;
    }

    private function getSourceConfig() {

        $json = file_get_contents( __DIR__ ."/sources/sources.config.json");
        $parsed = json_decode($json);

        $filtered = array_filter($parsed->sources, function($el){
            return $el->identifier == $this->api_source;
        });

        return $filtered[0];

    }

    private function getBaseUrl() {

        $config = $this->api_config;
        $api_limit_string = '&'.$config->limit.'=20';
        $api_token_string = '';
        $api_term_string = '&' . $config->term . '=';

        if(!empty($this->api_limit) && is_numeric($this->api_limit) && $this->api_limit < 20 && $this->api_limit > 0) {
            $api_limit_string = '&'.$config->limit.'='.$this->api_limit;
        }

        if($this->api_token) {
            $api_token_string = '&' . $config->token . '=' . $this->api_token;
        } 

        return $config->url . $config->endpoint . $api_limit_string . $api_token_string . $api_term_string;

    }

    private function getApiLogoAsBase64() {
        $content = file_get_contents(__DIR__ . "/sources/img/" . $this->api_source . ".svg");        
        return base64_encode($content);
    }

   /**
    * Renders the module
    *
    * @since 1.0.0
    */
    private function renderModule() {

        $this->setLanguageStrings();
        $this->includeJavascript();
        $this->includeCSS();

    }

   /**
    * Set Language Strings
    *
    * @since 1.0.0
    */    
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
    * Maps Results via Ajax Request
    *
    * @since 1.0.0
    */    
    public function mapResults($source, $results) {

        header('Content-Type: application/json; charset=UTF-8');
        $data = json_decode($results);

        //  Call mapper method by source
        $response = $this->getMappedResultsBySource($source, $data);        
        echo json_encode($response);
    }

    private function getMappedResultsBySource($identifier, $data) {

        //  Replace dots with underscores
        $class = str_replace(".", "_", $identifier);

        //  Get output format from settings
        $format = $this->getProjectSetting("output-format");

        //  Include class if not exists
        if (!class_exists($class)) include_once( __DIR__ . "./sources/" . $class . ".source.php");

        //  Dynamic class with namespaces and Argument Unpacking
        //  https://stackoverflow.com/a/30647705/3127170
        $class_with_namespace = "STPH\\addressAutoComplete\\".$class;
        $arrayOfConstructorParameters = array($data, $format);
        
        return ( new $class_with_namespace(...$arrayOfConstructorParameters) )->getMappedResults();        

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
                    STPH_addressAutoComplete.target_field = '<?= $this->target_field ?>';
                    STPH_addressAutoComplete.target_meta = '<?= $this->target_meta ?>';
                    STPH_addressAutoComplete.outputFormat = '<?= $this->outputFormat ?>';
                    STPH_addressAutoComplete.base_url = '<?= $this->getBaseUrl() ?>';
                    STPH_addressAutoComplete.base64_logo = '<?= $this->getApiLogoAsBase64() ?>'
                    STPH_addressAutoComplete.source_identifier = '<?= $this->api_config->identifier ?>';
                    STPH_addressAutoComplete.requestHandlerUrl = '<?= $this->getUrl("requestHandler.php") ?>';
                    STPH_addressAutoComplete.lang = <?php print json_encode($this->lang) ?>;
                    STPH_addressAutoComplete.debug = '<?= $this->debug ?>';
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