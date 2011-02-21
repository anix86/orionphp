<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

require_once 'data/TreeStore.php';
require_once 'impl/User.php';

class Workspace {
	
	/**
	 * @var TreeStore
	 */
	public $store;
	
	public function Workspace($store) {
		$this->store = $store;
	}
	
	/**
	 * 
	 * @param User $user
	 * @param $name
	 * @return null, if workspace not found
	 */
	public function createWorkspace($user, $name) {
		$map = array(
			"Name" => $name,
			"Workspace" => "true");
		
		return $this->store->addChild($user->getId(), $map);
	}
	
	/**
	 * @param User $user
	 */
	public function getWorkspaces($user) {
		$data = $this->store->getChildren($user->getId());
		if (empty ($data)) {
			$this->createWorkspace($user, "workspace");
			$data = $this->store->getChildren($user->getId());
		}
		
		return $data;
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