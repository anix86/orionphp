<?php

class Workspace {
	
	/**
	 * @var TreeStore
	 */
	public $store;
	
	public function Workspace($mysql) {
		$this->store = new TreeStore($mysql);
	}
	
	/**
	 * 
	 * 
	 * @param $name
	 * @return null, if workspace not found
	 */
	public function createWorkspace($name) {
		$map = array(
			"Name" => $name,
			"Workspace" => "true");
		
		return $this->store->addChild(null, $map);
	}
	
	/**
	 * Creates project
	 * 
	 * @param $workspaceId
	 * @param $name
	 * @return project id
	 */
	public function createProject($workspaceId, $name) {
		$map = array(
			"Name" => $name,
			"Project" => "true",
			"Directory" => "true"
		);
		
		return $this->store->addChild($workspaceId, $map);
	}
	
	public function createDirectory($parent, $name) {
		$map = array(
			"Name" => $name,
			"Directory" => "true"
		);
		
		return $this->store->addChild($parent, $map);
	}
	
	public function createEmptyFile($parent, $name) {
		$map = array(
			"Name" => $name,
			"Directory" => "false"
		);
		
		return $this->store->addChild($parent, $map);
	}
	
	public function rename($id, $newName) {
		$this->store->updateProperty($id, "Name", $newName);
	}
	
	public function delete($id) {
		$this->store->delete($id);
	}
	
	public function isWorkspace($props) {
		return jsonBool($props["Workspace"]);
	}
	
	public function isProject($props) {
		return jsonBool($props["Project"]);
	}
	
	public function isDirectory($props) {
		return jsonBool($props["Directory"]);
	}
}

?>