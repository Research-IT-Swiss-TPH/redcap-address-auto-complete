<?php
/** @var \STPH\addressAutoComplete\addressAutoComplete $module */

if ($_REQUEST['action'] == 'mapResults') {

    $source = htmlentities($_POST["source"]);
    $results = $_POST["results"];

    if(empty($source) || empty($results)) {
        header("HTTP/1.1 400 Bad Request");
        die("results or source missing!");
    }
    
    $module->mapResults($source, $results);
}

if($_REQUEST['action'] == 'getConfigDescription') {
    $pid = htmlentities($_POST["pid"]);
    $source = htmlentities($_POST["source"]);

    if(empty($pid) || empty($source)) {
        header("HTTP/1.1 400 Bad Request");
        die("pid or source missing!");
    }
    
    $module->getConfigDescription($pid,$source);
}

else {
    header("HTTP/1.1 400 Bad Request");
    header('Content-Type: application/json; charset=UTF-8');    
    die("The action does not exist.");
}