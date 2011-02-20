<?php

class File {
	
	public $fileStore;

	public $id;
	
	public function File($id, $mysql) {
		$this->fileStore = new Store($mysql);
		$this->id = $id;
	}
	
	public function setContents($value) {
		$currValue = $this->fileStore->get($this->id);
		if ($currValue == null) {
			$this->fileStore->add($this->id, $value);
		} else {
			$this->fileStore->update($this->id, $value);
		}
	}
	
	public function delete() {
		
	}
	
	public function getContents() {
		return $this->fileStore->get($this->id);
	}
	
}