<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

include_once 'init.php';
include_once 'impl/data/TreeStore.php';
include_once 'impl/data/Store.php';
include_once 'impl/User.php';
include_once 'impl/Workspace.php';
include_once 'impl/OrionResponseBuilder.php';

$id = $path;

$store = new TreeStore($mysqli);
$user = new User($store);
$ws = new Workspace($store);
$orb = new OrionResponseBuilder($store);

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
			$wsData = $ws->getWorkspaces($user);
			$response = $orb->createWorkspacesResponse($user, $wsData);
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
			$newId = $ws->createWorkspace($user, $name);
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
					$response = $orb->createFileMetaResponse($newId, $newctx, "");
				}
			}
		}

		if (!empty($response) && isset($response["Location"])) {
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


