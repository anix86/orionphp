<?php

class Store {
	
	private $mysql;
	
	private $debug = false;
	
	public function Store($mysql) {
		$this->mysql = $mysql;
	}
	
	/**
	 * Returns first value for given path
	 *
	 * @param unknown_type $path
	 * @param unknown_type $key
	 * @param unknown_type $mysql
	 * @return string
	 */
	public function get($id) {
		$queryStr = "select value from blobs p where id=$id";
		
		if ($this->debug) {
			echo $queryStr;
		}
		
		$qry = mysql_query($queryStr, $this->mysql) or die(mysql_error());
		$count = mysql_num_rows($qry);
		
		if ($count == 0) {
			return null;
		}
		
		$row = mysql_fetch_assoc($qry);
		return $row["value"];
	}
	
	/**
	 * Sets preferences
	 * 
	 * @param prefsPath
	 * @param key
	 * @param mysql
	 * @return boolean, false if failed, true if succeeded
	 */
	public function add($id, $value) {
		$queryStr = "insert into blobs (id,value) values ($id,\"$value\")";
		
		if ($this->debug) {
			echo $queryStr;
		}
		
		$qry = mysql_query($queryStr, $this->mysql) or die(mysql_error()); // error
		return true;
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $path
	 * @param unknown_type $value
	 * @param unknown_type $mysql
	 * @return true, if record was updated, false if it was not found
	 */
	public function update($id, $value) {
		$queryStr = "update blobs p set value=\"".$value."\" where id=$id";
		if ($this->debug) {
			echo $queryStr;
		}
		
		$qry = mysql_query($queryStr, $this->mysql) or die(mysql_error()); // error
		return mysql_affected_rows($qry) == 1;
	}
	
	/**
	 * Deletes preferences 
	 * 
	 * @param prefsPath
	 * @param key
	 * @param mysql
	 * @return boolean always true
	 */
	public function delete($id) {
		$queryStr = "delete from blobs where id=$id";
		
		if ($this->debug) {
			echo $queryStr;
		}
		
		$qry = mysql_query($queryStr, $this->mysql) or die(mysql_error()); // error
		
		return true;
	}
}

?>