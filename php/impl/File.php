<?php
/**
 * Copyright (c) 2011 jacek.pospychala@gmail.com
 */

class File {
	
	public $fileStore;

	public $id;
	
	public function File($id, $mysqli) {
		$this->fileStore = new Store($mysqli);
		$this->id = $id;
	}
	
	public function setContents($value) {
		$this->fileStore->set($this->id, $value);
	}
	
	public function delete() {
		$this->fileStore->delete($this->id);
		// TODO delete also metadata
	}
	
	public function getContents() {
		return $this->fileStore->get($this->id);
	}
	
}