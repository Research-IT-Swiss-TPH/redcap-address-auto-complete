<?php

// Set the namespace defined in your config file
namespace STPH\addressAutoComplete;

use \REDCap;

if (file_exists("vendor/autoload.php")) {
    require 'vendor/autoload.php';
}

// Declare your module class, which must extend AbstractExternalModule 
class addressAutoComplete extends \ExternalModules\AbstractExternalModule
{

    /** @var string */
    private $api_source;

    /** @var string */
    private $api_limit;

    /** @var string */
    private $api_key;

    /** @var object */
    private $api_config;

    /** @var bool */
    private $isEnabledForDataEntry;

    /** @var bool */
    private $isEnabledForSurvey;

    /** @var bool */
    private $isEnabledAdvancedSave;

    /** @var bool */
    private $isEnabledCustomAddress;

    /** @var bool */
    private $isEnabledDebug;

    /** @var array */
    private $configuration;

    /** @var array */
    private $language;

    /** @var array */
    private $helpers;

    /** @var array */
    private $instructions;

    /**
     * Constructs the class
     *
     */
    public function __construct()
    {
        parent::__construct();
        // Other code to run when object is instantiated
        $this->api_source = "";
        $this->api_limit = "";
        $this->api_key = "";
        $this->api_config = (object)[];

        $this->isEnabledForDataEntry = false;
        $this->isEnabledForSurvey = false;
        $this->isEnabledAdvancedSave = false;
        $this->isEnabledCustomAddress = false;

        $this->configuration = [];
        $this->language = [];
        $this->helpers = [];
        $this->instructions = [];
    }

    /**
     * Hooks Address Auto Complete module to redcap_every_page_top    
     *
     * @param string $project_id    
     * @since 1.0.0
     *
     */
    public function redcap_every_page_top($project_id = null): void
    {

        $this->setSettings();

        if ($this->isPage("DataEntry/index.php") && $this->isEnabledForDataEntry) {
            $this->renderModule();
        }
    }


    /**
     * Hooks Address Auto Complete module to redcap_survey_page_top    
     *
     * @since 1.0.0
     *
     */
    function redcap_survey_page_top(): void
    {

        if ($this->isEnabledForSurvey) {
            $this->renderModule();
        }
    }


    /**
     * Hooks into redcap_module_configuration_settings
     *
     * @param string $project_id
     * @param array $settings
     *
     * @since 1.0.0
     *
     */
    function redcap_module_configuration_settings($project_id, $settings): array
    {

        if ($project_id != null) {
            foreach ($settings as &$setting) {
                if ($setting["key"] == "api-description") {
                    $setting["name"] = '<div data-pid="' . $project_id . '" data-url="' . $this->getUrl("requestHandler.php") . '" style="padding:15px;display:inline-block;" id="api-description-wrapper">' . $this->generate_config_description($project_id) . '</div><script src=' . $this->getUrl("js/config.js") . '></script>';
                }
            }
        }
        return $settings;
    }

    /**
     * Generates config description
     *
     * @param string $pid
     * @param string $source
     *
     * @since 1.0.0
     *
     */
    private function generate_config_description($pid, $source = null): string
    {

        if ($source == null) {
            $saved_source = $this->getProjectSetting("api-source", $pid);

            if (empty($saved_source)) {
                return "";
            }
            $this->api_source = $this->getProjectSetting("api-source", $pid);
        } else {
            $this->api_source = $source;
        }

        $source_config = $this->getSourceConfig();
        $base64 = $this->getApiLogoAsBase64();
        $html_logo = "";
        $html_identifier = "<b>" . $this->api_source . "</b>";
        $html_description = "<p>" . $source_config->description . "</p>";
        $html_documentation = "";

        if ($base64) {
            $html_logo = "<image src='data:image/svg+xml;base64, " . $base64 . "' width='30' alt='api-logo' style='margin-right:20px;'>";
        }

        if (!empty($source_config->documentation)) {
            $html_documentation = "<a target='_blank' href='" . $source_config->documentation . "'><i class='fas fa-book'></i> API Documentation</a>";
        }

        if (!empty($source_config->registration)) {
            $html_registration = "<a style='margin-left:10px' target='_blank' href='" . $source_config->registration . "'><i class='fas fa-key'></i> API Registration</a>";
        }

        return $html_logo . $html_identifier . $html_description . $html_documentation . $html_registration;
    }


    /**
     * Returns config description via AJAX
     *
     * @param string $pid
     * @param string $source
     *
     * @since 1.0.0
     *
     */
    public function getConfigDescription($pid, $source): void
    {
        header('Content-Type: application/json; charset=UTF-8');

        $html = $this->generate_config_description($pid, $source);
        $response = ["html" => $html];

        echo json_encode($response);
    }

    /**
     * Sets settings
     *
     *
     * @since 1.0.0
     *
     */
    private function setSettings(): void
    {


        //  Add general validation here

        $this->api_source   = $this->getProjectSetting("api-source");
        $this->api_limit    = $this->getProjectSetting("api-limit");
        $this->api_key      = $this->getProjectSetting("api-key");
        $this->api_config   = $this->getSourceConfig();

        $this->isEnabledForDataEntry    = $this->getProjectSetting("enable-for-data-entry");
        $this->isEnabledForSurvey       = $this->getProjectSetting("enable-for-survey");
        $this->isEnabledAdvancedSave    = $this->getProjectSetting("enable-advanced-save");
        $this->isEnabledCustomAddress   = $this->getProjectSetting("enable-custom-address");
        $this->isEnabledDebug           = $this->getProjectSetting("javascript-debug");

        $this->configuration = array(

            "api"     => array(
                "url_base"              => $this->getBaseUrl(),
                "url_endpoint"          => $this->getEndpointUrl(),
                "url_params"            => $this->getUrlParams(),
                "base64_logo"           => $this->getApiLogoAsBase64(),
                "source_identifier"     => $this->api_config->identifier,
                "has_secondary_action"  => $this->api_config->secondary
            ),
            "options" => array(
                "enable_for_data_entry" => $this->isEnabledForDataEntry,
                "enable_for_survey"     => $this->isEnabledForSurvey,
                "enable_advanced_save"  => $this->isEnabledAdvancedSave,
                "enable_custom_address" => $this->isEnabledCustomAddress,
                "enable_debug"          => $this->isEnabledDebug
            )
        );

        $this->helpers = array(
            "url_request_handler"       => $this->getUrl("requestHandler.php"),
            "url_custom_address_modal"  => $this->getSurveyUrl("customAddressModal.html"),
            "url_gateway"               => $this->getSurveyUrl("gateway.php") . "&NOAUTH",
            "session_id"                => session_id(),
            "survey_hash"               => htmlentities($_GET["s"], ENT_QUOTES),
            "is_survey_page"            => ((isset($_GET['s']) && PAGE == "surveys/index.php" && defined("NOAUTH")) || PAGE == "Surveys/theme_view.php"),
            "csrf_token"                => $this->getCSRFToken()
        );

        if ($this->getProjectSetting("target-fields") == NULL) {

            $this->instructions[0] = array(
                "target_field" => $this->getProjectSetting("target-field"),
                "target_meta"  => $this->getProjectSetting("target-meta"),
                "advanced_fields" => []
            );

            //  Advanced Save
            if ($this->isEnabledAdvancedSave) {

                $this->instructions[0]["advanced_fields"] = array(
                    "street" => $this->getProjectSetting("field-street"),
                    "number" => $this->getProjectSetting("field-number"),
                    "code" => $this->getProjectSetting("field-code"),
                    "city" => $this->getProjectSetting("field-city"),
                    "country" => $this->getProjectSetting("field-country"),
                    "note" => $this->getProjectSetting("field-note")
                );
            }
        } else {

            //  Fetch raw instructions from settings
            $instructions_raw = $this->getSubSettings("target-fields");

            # Validate input
            $has_duplicate_within_instruction = false;
            $has_duplicate_across_instruction = false;
            $instructions_merged = [];
            $conflict = "";

            //  Do not accept duplicate fields across and within instruction
            foreach ($instructions_raw as $i => $instruction_raw) {

                $instruction_filtered = array_filter($instruction_raw);

                if (count(array_unique($instruction_filtered)) != count($instruction_filtered)) {
                    $has_duplicate_within_instruction = true;
                    break;
                }

                foreach ($instruction_filtered as $key => $value) {
                    if (!in_array($value, (array)$instructions_merged[$key])) {
                        $instructions_merged[$key][] = $value;
                    } else {
                        $has_duplicate_across_instruction = true;
                        $conflict = [$value, $key, $i];
                        break;
                    }
                }
            }

            if ($has_duplicate_within_instruction || $has_duplicate_across_instruction) {
                $error_message = "Invalid configuration in module <b>" . $this->getModuleName() . "</b>. The field <code>" . $conflict[0] . "</code>a has been used too often in " . ($conflict[2] + 1) . ". Instruction. You cannot use a field multiple times as a target. Please adjust module configuration so that the module can be activated.";
?>
                <script type="text/javascript">
                    console.log('<?= $error_message ?>');
                    $(function() {
                        var html = '<div style="max-width:800px;margin:2px 0 2px;border-color:#ffeeba!important; margin-bottom:20px;" class="alert alert-warning" role="alert"><b>Warning</b><br><?= $error_message ?></div>';
                        $("#subheader").after(html);
                    });
                </script>
        <?php
                return;
            }

            //  Create the actual array used to run instructions
            foreach ($instructions_raw as $key => $instruction_raw) {
                $this->instructions[$key] = array(
                    "target_field"      => $instruction_raw["target-field"],
                    "target_meta"       => $instruction_raw["target-meta"],
                    "advanced_fields"   => array(
                        "street"    => $instruction_raw["field-street"],
                        "number"    => $instruction_raw["field-number"],
                        "code"      => $instruction_raw["field-code"],
                        "city"      => $instruction_raw["field-city"],
                        "country"   => $instruction_raw["field-country"],
                        "note"      => $instruction_raw["field-note"]
                    ),
                    "timestamp_field" => $instruction_raw["timestamp"]
                );
            }
        }
    }

    /**
     * Parses Sources from json
     *
     *
     * @since 1.0.0
     *
     */
    private function getSourceConfig(): object
    {

        //  Return empty object when first enabling module
        if(empty($this->api_source)) {
            return (object)[];
        }

        $json = file_get_contents(__DIR__ . "/sources/sources.json");
        $parsed = json_decode($json);
        
        $filtered = array_filter($parsed->sources, function ($el) {
            return $el->identifier == $this->api_source;
        });

        return reset($filtered);
    }

    /**
     * Gets Base Url from config
     *
     *
     * @since 1.0.0
     *
     */
    private function getBaseUrl(): string
    {

        //$isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443;
        //$protocol = $isSecure ? 'https://' : 'http://';
        $protocol = "https://";

        return $protocol . $this->api_config->url;
    }

    /**
     * Gets Endpoint Url 
     *
     *
     * @since 1.2.0
     *
     */
    private function getEndpointUrl(): string
    {
        $base = $this->getBaseUrl();

        if ($this->api_config->term == "") {
            $api_term_string = "/";
        } else {
            $api_term_string = '&' . $this->api_config->term . '=';
        }

        return $base . $this->api_config->endpoint . $api_term_string;
    }

    private function getUrlParams(): string
    {

        $config = $this->api_config;
        $api_limit_string = '&' . $config->limit . '=20';
        $api_token_string = '';

        if (!empty($this->api_limit) && is_numeric($this->api_limit) && $this->api_limit < 20 && $this->api_limit > 0) {
            $api_limit_string = "&" . $config->limit . '=' . $this->api_limit;
        }

        if ($this->api_key) {
            $api_token_string = ($this->api_config->term == "" ? "?" : "&") . $config->token . '=' . $this->api_key;
        }


        return $api_token_string . $api_limit_string;
    }


    /**
     * Generates config description
     *
     * @return false|string
     * @since 1.0.0
     *
     */
    private function getApiLogoAsBase64()
    {
        $path = $this->getSafePath(__DIR__ . "/sources/img/" . $this->api_source . ".svg");
        $content = file_get_contents($path);

        if ($content) {
            return base64_encode($content);
        }

        return false;
    }

    /**
     * Renders the module
     *
     * @since 1.0.0
     *
     * @return void
     */
    private function renderModule(): void
    {
        # Will render module only if a valid API source has been selected and at least one instruction exists
        if ($this->api_source != "your.api.here" && count($this->instructions) > 0) {
            $this->setLanguageStrings();
            $this->includeJavascript();
            $this->includeCSS();
        }
    }

    /**
     * Sets Language Strings
     *
     * @since 1.0.0
     *
     * @return void
     */
    private function setLanguageStrings(): void
    {

        $this->language = array(
            "aac_status_default" => $this->tt("aac_status_default"),
            "aac_status_is_loading" => $this->tt("aac_status_is_loading"),
            "aac_status_is_not_listed" => $this->tt("aac_status_is_not_listed"),
            "aac_status_is_not_listed_ca" => $this->tt("aac_status_is_not_listed_ca"),
            "aac_status_is_listed" => $this->tt("aac_status_is_listed"),
            "aac_status_is_valid" => $this->tt("aac_status_is_valid"),
            "aac_status_is_custom" => $this->tt("aac_status_is_custom"),
            "aac_reset_address" => $this->tt("aac_reset_address"),
            "alert_no_selection" => $this->tt("alert_no_selection"),
            "cam_title" => $this->tt("cam_title"),
            "cam_field_street" => $this->tt("cam_field_street"),
            "cam_field_number" => $this->tt("cam_field_number"),
            "cam_field_city" => $this->tt("cam_field_city"),
            "cam_field_code" => $this->tt("cam_field_code"),
            "cam_field_country" => $this->tt("cam_field_country"),
            "cam_field_add_note" => $this->tt("cam_field_add_note"),
            "cam_button_add" => $this->tt("cam_button_add"),
            "cam_button_cancel" => $this->tt("cam_button_cancel")
        );
    }

    /**
     * Maps Results via Ajax Request
     *
     * @param string $source
     * @param object $results
     * @since 1.0.0
     *
     * @return void
     */
    public function mapResults($source, $results): void
    {

        header('Content-Type: application/json; charset=UTF-8');
        //$data = json_decode($results);

        //  Call mapper method by source
        $response = $this->getMappedResultsBySource($source, $results);
        echo json_encode($response);
    }

    public function mapResultsFromGateway($source, $results, $pid) {
        header('Content-Type: application/json; charset=UTF-8');
        $response = $this->getMappedResultsBySource($source, $results, $pid);
        echo json_encode($response);
    }


    /**
     * Gets Mapped Results by Source
     *
     * @param string $identifier
     * @param object $data
     * 
     * @since 1.0.0
     *
     */
    private function getMappedResultsBySource($identifier, $data, $pid=null): ?array
    {

        //  Replace dots with underscores
        $class = str_replace(".", "_", $identifier);

        //  Get output format from settings
        $format = $this->getProjectSetting("output-format", $pid);
        
        //  Include class if not exists
        $path = $this->getSafePath(__DIR__ . "/sources/" . $class . ".source.php");
        if (!class_exists($class)) include_once($path);

        //  Dynamic class with namespaces and Argument Unpacking
        //  https://stackoverflow.com/a/30647705/3127170
        $class_with_namespace = "STPH\\addressAutoComplete\\" . $class;
        $arrayOfConstructorParameters = array($data, $format);

        return (new $class_with_namespace(...$arrayOfConstructorParameters))->getMappedResults();
    }

    /**
     * Includes JavaScript files
     *
     * @since 1.0.0
     *
     * @return void
     */
    private function includeJavascript(): void
    {
        ?>
        <script src="<?php print $this->getUrl('js/main.js'); ?>"></script>
        <script>
            $(function() {
                $(document).ready(function() {

                    STPH_addressAutoComplete.configuration = <?= json_encode($this->configuration) ?>;
                    STPH_addressAutoComplete.language = <?= json_encode($this->language) ?>;
                    STPH_addressAutoComplete.helpers = <?= json_encode($this->helpers) ?>;
                    STPH_addressAutoComplete.instructions = <?= json_encode($this->instructions) ?>;

                    STPH_addressAutoComplete.init();
                })
            });
        </script>
        <?php

        if ($this->api_config->secondary) {
            //  Replace dots with underscores
            $func_name = str_replace(".", "_", $this->api_config->identifier);
        ?>
            <script src="<?php print $this->getUrl('js/secondary/' . $func_name . '.js'); ?>"></script>
        <?php
        }
    }



    /**
     * Includes Style files
     *
     * @since 1.0.0    
     *
     * @return void
     */
    private function includeCSS(): void
    {
        ?>
        <link rel="stylesheet" href="<?= $this->getUrl('style.css') ?>">
<?php
    }


    /**
     * Returns URL for the case of Survey page requests, normal URL else.
     * Omits CORS issues.
     * 
     * @since 3.1.0
     * @return string
     * 
     */
    private function getSurveyUrl($file) {

        $APP_PATH_SURVEYROOT = str_replace(APP_PATH_SURVEY, "", APP_PATH_SURVEY_FULL);
        $IS_SURVEY_PAGE = ((isset($_GET['s']) && PAGE == "surveys/index.php" && defined("NOAUTH")) || PAGE == "Surveys/theme_view.php");
        $url = $this->getUrl($file, true , true);
        if( $APP_PATH_SURVEYROOT !== APP_PATH_WEBROOT_FULL && $IS_SURVEY_PAGE) {
            $url = str_replace(APP_PATH_WEBROOT_FULL, $APP_PATH_SURVEYROOT . APP_PATH_WEBROOT_PARENT,  $url);
        }

        return $url;
    }

}
