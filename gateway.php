<?php

$source = $_POST["source"];


header('Content-Type: application/json; charset=UTF-8');

echo json_encode(array("source"=>$source));
