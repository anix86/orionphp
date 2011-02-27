<?php
/**
 * Copyright (c) 2011 jacek.pospychala@gmail.com
 */

class Store {
	
	/**
	 * @var mysqli
	 */
	private $mysqli;
	
	private $debug = false;
	
	public function Store($mysqli) {
		$this->mysqli = $mysqli;
		$this->initStore();
	}
	
	private function initStore() {
		$this->mysqli->query("CREATE TABLE IF NOT EXISTS `blobs` (  `id` int(11) NOT NULL,  `value` blob NOT NULL)");
	}
	
	/**
	 * Get entry value
	 *
	 * @return string
	 */
	public function get($id) {
		$stmt = $this->mysqli->prepare("select value from blobs p where id=?");
		$stmt->bind_param("i", $id);
		if (!$stmt->execute()) {
			return false;
		}
		
		$stmt->bind_result($value);
		if (!$stmt->fetch()) {
			return null;
		}
		$stmt->close();
		
		return $value;
	}
	
	public function set($id, $value) {
		if (!$this->update($id, $value)) {
			$this->add($id, $value);
		}
	}
	
	/**
	 * Add entry in store
	 * 
	 * @return boolean, false if failed, true if succeeded
	 */
	private function add($id, $value) {
		$stmt = $this->mysqli->prepare("insert into blobs (id,value) values (?,?)");
		$stmt->bind_param("is", $id, $value);
		return $stmt->execute();
	}
	
	/**
	 * Update entry in store
	 * 
	 * @return true, if record was updated, false if it was not found
	 */
	private function update($id, $value) {
		$stmt = $this->mysqli->prepare("update blobs p set value=? where id=?");
		$stmt->bind_param("si", $value, $id);
		if (!$stmt->execute()) {
			return false;
		}
		
		return $stmt->affected_rows > 0;
	}
	
	/**
	 * Delete entry 
	 * 
	 * @return boolean always true
	 */
	public function delete($id) {
		$stmt = $this->mysqli->prepare("delete from blobs where id=?");
		$stmt->bind_param("i", $id);
		return $stmt->execute();
	}
}

?>