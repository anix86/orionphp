<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

$requestMethod = $_SERVER["REQUEST_METHOD"];
$path = $_GET["rewriteP1"];

$requestBody = @file_get_contents('php://input');
if (! empty($requestBody)) {
	$requestJson = json_decode($requestBody, true);
}

$mysqli = new mysqli("4954.mysql.win.pl", "ad4954_nimini", "z8m77VV2", "bd4954_nimini");
if (mysqli_connect_errno()) {
    error_log("Connect failed: %s\n", mysqli_connect_error());
    return;
}

// util

/**
 * Indents a json string to make it more human-readable.
 */
function json_indent($json) {
	$json = str_replace("\/", "/", $json);

    $result      = '';
    $pos         = 0;
    $strLen      = strlen($json);
    $indentStr   = '  ';
    $newLine     = "\n";
    $prevChar    = '';
    $outOfQuotes = true;

    for ($i=0; $i<=$strLen; $i++) {

        // Grab the next character in the string.
        $char = substr($json, $i, 1);

        // Are we inside a quoted string?
        if ($char == '"' && $prevChar != '\\') {
            $outOfQuotes = !$outOfQuotes;
        
        // If this character is the end of an element, 
        // output a new line and indent the next line.
        } else if(($char == '}' || $char == ']') && $outOfQuotes) {
            $result .= $newLine;
            $pos --;
            for ($j=0; $j<$pos; $j++) {
                $result .= $indentStr;
            }
        }
        
        // Add the character to the result string.
        $result .= $char;

        // If the last character was the beginning of an element, 
        // output a new line and indent the next line.
        if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
            $result .= $newLine;
            if ($char == '{' || $char == '[') {
                $pos ++;
            }
            
            for ($j = 0; $j < $pos; $j++) {
                $result .= $indentStr;
            }
        }
        
        $prevChar = $char;
    }

    return $result;
}

/**
 * @return true if arg is not empty and is boolean true, or string "true"
 */
function jsonBool($arg) {
	return (!empty($arg)) && ((is_bool($arg) && ($arg == true)) || (is_string($arg) && ($arg == "true")));
}


?>