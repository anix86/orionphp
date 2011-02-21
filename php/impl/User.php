<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

require_once 'data/TreeStore.php';

class User {
	
	private $name;
	private $id;
	
	/**
	 * @param TreeStore $store
	 */
	public function User($store) {
		if (isset($_COOKIE["zendaurionUserName"])) {
			$this->name = $_COOKIE["zendaurionUserName"];
			$this->id = $_COOKIE["zendaurionUserId"]; 
		} else {
			
			$this->name = "guest";
			$this->id = $store->addChild(null, array("Name" => "guest"));
			
			setcookie("zendaurionUserName", $this->name);
			setcookie("zendaurionUserId", $this->id);
		}
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function getId() {
		return $this->id;
	}
}