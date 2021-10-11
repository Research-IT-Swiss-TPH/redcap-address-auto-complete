<?php
/** @var \STPH\addressAutoComplete\addressAutoComplete $module */

if ($_REQUEST['action'] == 'mapResults') {

    $source = htmlentities($_POST["source"]);
    $results = $_POST["results"];
    $module->mapResults($source, $results);
}

else {
    header("HTTP/1.1 400 Bad Request");
    header('Content-Type: application/json; charset=UTF-8');    
    die("The action does not exist.");
}