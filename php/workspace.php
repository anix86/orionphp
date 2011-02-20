<?php

include 'init.php';
include 'impl/data/TreeStore.php';
include 'impl/data/Store.php';
include 'impl/Workspace.php';
include 'impl/OrionResponseBuilder.php';

$id = $path;
$ws = new Workspace($mysql);
$orb = new OrionResponseBuilder($mysql);

switch ($requestMethod) {
			
	case "PUT": // update properties
		$name = $_SERVER["HTTP_SLUG"];
		if (empty($name)) {
			$name = $requestJson["Name"];
		}
		
		if (empty($name)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Name missing");
			return;
		}
		
		if (empty($id)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Workspace id missing");
			return;
		} else {
			$ws->rename($id, $name);
		}
		
		// break; // no break, send regular GET response for given ID
		
	case "GET":
		if (empty($id)) {
			$response = $orb->createWorkspacesResponse();
		} else {
			$ctx = $ws->store->getProperties($id);
			if ($ws->isWorkspace($ctx)) {
				$response = $orb->createWorkspaceResponse($id, $ctx);
			} else if ($ws->isProject($ctx)) {
				$response = $orb->createProjectResponse($id, $ctx);
			} else if ($ws->isDirectory($ctx)) {
				$response = $orb->createDirectoryResponse($id, $ctx);
			}
		}
		
		if (empty($response)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Not Found");
		} else {
			header("Content-Type: application/json");
			echo json_indent(json_encode($response));
		}
		break;

		
	case "POST":
		$name = $_SERVER["HTTP_SLUG"];
		if (empty($name)) {
			$name = $requestJson["Name"];
		}
		
		if (empty($name)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Name missing");
			return;
		}
		
		if (empty($id)) {
			$newId = $ws->createWorkspace($name);
			$newctx = $ws->store->getProperties($newId);
			$response = $orb->createWorkspaceResponse($newId, $newctx);
		} else {
			$ctx = $ws->store->getProperties($id);
			if ($ws->isWorkspace($ctx)) {
				$newId = $ws->createProject($id, $name);
				$newctx = $ws->store->getProperties($newId);
				$response = $orb->createProjectResponse($newId, $newctx);
			} else {
				$createDir = jsonBool($requestJson["Directory"]);
				
				if ($createDir) {
					$newId = $ws->createDirectory($id, $name);
					$newctx = $ws->store->getProperties($newId);
					$response = $orb->createDirectoryResponse($newId, $newctx);
				} else {
					$newId = $ws->createEmptyFile($id, $name);
					$newctx = $ws->store->getProperties($newId);
					$response = $orb->createFileResponse($newId, $newctx);
				}
			}
		}

		if (!empty($response)) {
			header("Location: ".$response["Location"]);
		}
		
		if (empty($response)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Not Found");
		} else {
			header("Content-Type: application/json");
			echo json_indent(json_encode($response));
		}
		break;
		
	case "DELETE" :
		if (empty($id)) {
			header($_SERVER["SERVER_PROTOCOL"] . " 404 Not Found");
			return;
		}

		$ws->delete($id);
		break;
		
	default :
		// empty
}


