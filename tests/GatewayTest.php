<?php namespace STPH\addressAutoComplete;

// For now, the path to "redcap_connect.php" on your system must be hard coded.
require_once __DIR__ . '/../../../redcap_connect.php';


use ExternalModules\ExternalModules;
use \GuzzleHttp\Psr7;
use \HttpClient;
use \GuzzleHttp\Exception\ClientException;

final class GatewayTest extends BaseTest {

    private $http;
    private $base_url;


    public function testFoo() {

        $expected = "foo";
        $actual  = "foo";
        
        $this->assertSame($expected, $actual);
    }


}