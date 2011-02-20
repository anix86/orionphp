<?php

include 'init.php';
include 'impl/data/Store.php';
include 'impl/Workspace.php';
include 'impl/OrionResponseBuilder.php';
include 'impl/File.php';

$id = $path;
$ws = new Workspace($mysql);
$orb = new OrionResponseBuilder($mysql);

switch ($requestMethod) {
			
	case "PUT": // update contents
		
		if (empty($id)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 File id missing");
			return;
		} else {
			$file = new File($id, $mysql);
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
				$file = new File($id, $mysql);
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

		
	case "POST":
		
		break;
		
	case "DELETE" :
		$ws->delete($id);
		break;
		
	default :
		// empty
}

?>