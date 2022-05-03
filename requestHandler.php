<?php
/** @var \STPH\addressAutoComplete\addressAutoComplete $module */

if ($_REQUEST['action'] == 'mapResults') {


    if(empty($_POST["source"]) || empty($_POST["results"])) {
        header("HTTP/1.1 400 Bad Request");
        die("results or source missing!");
    }

    $source = htmlentities($_POST["source"], ENT_QUOTES);
    $results = json_decode($_POST["results"]);

    
    $module->mapResults($source, $results);
}

else if($_REQUEST['action'] == 'getConfigDescription') {

    if(empty($_POST["pid"]) || empty($_POST["source"])) {
        header("HTTP/1.1 400 Bad Request");
        die("pid or source missing!");
    }    

    $pid = htmlentities($_POST["pid"], ENT_QUOTES);
    $source = htmlentities($_POST["source"], ENT_QUOTES);
    
    $module->getConfigDescription($pid,$source);
}

else {
    header("HTTP/1.1 400 Bad Request");
    header('Content-Type: application/json; charset=UTF-8');    
    die("The action does not exist.");
}