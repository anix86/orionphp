<?php

class OrionResponseBuilder {
	/**
	 * @var TreeStore
	 */
	public $store;
	
	public function OrionResponseBuilder($mysql) {
		$this->store = new TreeStore($mysql);
	}
	
	public function createWorkspacesResponse() {
		$resp = array();
		$resp["UserName"] = "jacek";
		$resp["Id"] = "89123123"; // user id

		$workspaces = array();
		$data = $this->store->getChildren(null);
		foreach ($data as $id => $map) {
			$workspaces[] = array(
				"Id" => $id,
				"Location" => "http://" . $_SERVER["HTTP_HOST"]."/workspace/$id",
				"LastModified" => $map["LastModified"],
				"Name" => $map["Name"]);
		}
		$resp["Workspaces"] = $workspaces;
		
		
		
		return $resp;
	}
	
	public function createWorkspaceResponse($id, $data) {
		$resp = array();
		$resp["Id"] = $id;
		$resp["Name"] = $data["Name"];
		$resp["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$id";
		$resp["ChildrenLocation"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$id";
		$resp["Directory"] = "true";
		$resp["SearchLocation"] = "";
		
		$childrenData = $this->store->getChildren($id);
		$children = array();
		$projects = array();
		foreach ($childrenData as $child => $map) {
			$projects[] = array(
				"Id" => $child, 
				"Location" => "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child");
			
			$c = array(
				"Name" => $map["Name"], 
				"Directory" => jsonBool($map["Directory"]));
			if (jsonBool($map["Directory"])) {
				$c["ChildrenLocation"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child?depth=1";
				$c["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child";
			} else {
				$c["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/file/$child";
			}
			$children[] = $c;
		}
		
		$resp["Children"] = $children;
		$resp["Projects"] = $projects;
		
		return $resp;
	}
	
	/**
	 * Returns project data
	 * 
	 * @param unknown_type $workspaceId
	 * @param unknown_type $id
	 * @return null, if project not found
	 */
	public function createProjectResponse($id, $data) {
		$resp = array(
			"Id" => $id,
			"Name" => $data["Name"],
			"Directory" => true,
			//"ContentLocation" => "http://" . $_SERVER["HTTP_HOST"]."/file/$id",
			"ChildrenLocation" => "http://" . $_SERVER["HTTP_HOST"]."/workspace/$id?depth=1",
			"Location" => "http://" . $_SERVER["HTTP_HOST"]."/file/$id",
			"LocalTimeStamp" => time(),
			"Parents" => array()
		);
		
		$childrenData = $this->store->getChildren($id);
		$children = array();
		foreach ($childrenData as $child => $map) {
			$c = array(
				"Name" => $map["Name"], 
				"Directory" => jsonBool($map["Directory"]));
			if (jsonBool($map["Directory"])) {
				$c["ChildrenLocation"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child?depth=1";
				$c["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child";
			} else {
				$c["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/file/$child";
			}
			$children[] = $c;
		}
		if (count($children) > 0) {
			$resp["Children"] = $children;
		}
		
		return $resp;
	}
	
	public function createDirectoryResponse($id, $data) {
		$resp = array();
		$resp["Name"] = $data["Name"];
		$resp["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$id";
		$resp["ChildrenLocation"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$id";
		$resp["Directory"] = true;
		
		$childrenData = $this->store->getChildren($id);
		$children = array();
		foreach ($childrenData as $child => $map) {
			$c = array(
				"Name" => $map["Name"], 
				"Directory" => jsonBool($map["Directory"]));
			if (jsonBool($map["Directory"])) {
				$c["ChildrenLocation"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child?depth=1";
				$c["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/workspace/$child";
			} else {
				$c["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/file/$child";
			}
			$children[] = $c;
		}
		if (count($children) > 0) {
			$resp["Children"] = $children;
		}
		
		return $resp;
	}
	
	public function createFileMetaResponse($id, $data) {
		$resp = array();
		$resp["Name"] = $data["Name"];
		$resp["Location"] = "http://" . $_SERVER["HTTP_HOST"]."/file/$id";
		$res["Charset"] = "UTF-8";
		$res["Content-Type"] = "text/plain";
		$resp["Directory"] = false;
		
		return $resp;
	}
	
	public function createFileBodyResponse($body) {
		return $body;
	}
	
	public function createFileResponse($id, $data, $body) {
		$meta = $this->createFileMetaResponse($id, $data);
		$body = $this->createFileBodyResponse($id);
		
		header("Content-Type: multipart/related; boundary=\"BOUNDARY\"");
		echo "--BOUNDARY\r\n";
		echo "Content-Type: application/json\r\n\r\n";
		echo json_encode($meta)."\r\n";
		echo "--BOUNDARY\r\n";
		echo "Content-Type: text/plain\r\n\r\n";
		echo $body;
	}
}