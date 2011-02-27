<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

include 'init.php';
include 'impl/data/Store.php';
include 'impl/Workspace.php';
include 'impl/OrionResponseBuilder.php';
include 'impl/File.php';

$id = $path;

$store = new TreeStore($mysqli);
$user = new User($store);
$ws = new Workspace($store);
$orb = new OrionResponseBuilder($store);

switch ($requestMethod) {
			
	case "PUT": // update contents
		
		if (empty($id)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 File id missing");
			return;
		} else {
			$file = new File($id, $mysqli);
			$file->setContents($requestBody);
			
			$ctx = $ws->store->getProperties($id);
			header("Content-Type: application/json");
			echo json_encode($orb->createFileMetaResponse($id, $ctx));
		}
		
		break;
		
	case "GET":
		if (empty($id)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 File id missing");
			return;
		} else {
			$parts = $_GET["parts"];
			
			if (is_string(strstr($parts, "meta"))) {
				$getMeta = true;
				$ctx = $ws->store->getProperties($id);
			}
			if (empty($parts) || is_string(strstr($parts, "body"))) {
				$getBody = true;
				$file = new File($id, $mysqli);
				$body = $file->getContents();
			}
			
			if ($getMeta && $getBody) {
				$orb->createFileResponse($id, $ctx, $body);
			} else if ($getMeta) {
				header("Content-Type: application/json");
				echo json_encode($orb->createFileMetaResponse($id, $ctx));
			} else if ($getBody) {
				header("Content-Type: text/plain");
				echo $orb->createFileBodyResponse($body);
			}
			
		}
		
		break;

		
	case "POST": // create file
		$name = $_SERVER["HTTP_SLUG"];
		if (empty($name)) {
			$name = $requestJson["Name"];
		}
		
		if (empty($name)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Name missing");
			return;
		}
		
		if (empty($id)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Parent unknown");
			return;
		}
		
		$createDir = jsonBool($requestJson["Directory"]);
				
		if ($createDir) {
			$newId = $ws->createDirectory($id, $name);
			$newctx = $ws->store->getProperties($newId);
			$response = $orb->createDirectoryResponse($newId, $newctx);
		} else {
			$newId = $ws->createEmptyFile($id, $name);
			$newctx = $ws->store->getProperties($newId);
			$response = $orb->createFileMetaResponse($newId, $newctx, "");
		}
		
		if (empty($response)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Failed to create");
			return;
		} 
		
		if (isset($response["Location"])) {
			header("Location: ".$response["Location"]);
		}
		
		header("Content-Type: application/json");
		echo json_indent(json_encode($response));
		
		break;
		
	case "DELETE" :
		$ws->delete($id);
		break;
		
	default :
		// empty
}

?>