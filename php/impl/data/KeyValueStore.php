<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

class KeyValueStore {
	
	private $table;
	
	/**
	 * @var mysqli
	 */
	private $mysqli;
	
	private $debug = true;
	
	private $userid;
	
	public function KeyValueStore($mysqli, $userid, $storeName) {
		$this->table = $storeName;
		$this->mysqli = $mysqli;
		$this->userid = $userid;
		$this->initStore();
	}
	
	private function initStore() {
		$this->mysqli->query("CREATE TABLE IF NOT EXISTS `".$this->table."` (  `userid` int(11) NOT NULL,  `path` varchar(255) NOT NULL,  `key` varchar(255) NOT NULL,  `value` varchar(255) NOT NULL)");
	}
	
	/**
	 * Returns key->value map
	 * 
	 * @param unknown_type $path
	 * @param unknown_type $key
	 * @return map
	 */
	public function getPath($path, $key) {
		if (!empty($key)) {
			$queryStr = "select p.key, p.value from ".$this->table." p where userid = ".$this->userid." and p.path=? and p.key=?";
			$stmt = $this->mysqli->prepare($queryStr);
			if (!$stmt) {
				error_log("KeyValueStore.getPath($path,$key) error 1:".$this->mysqli->error);
			}
			$stmt->bind_param("ss", $path, $key);
		} else {
			$queryStr = "select p.key, p.value from ".$this->table." p where userid = ".$this->userid." and p.path=?";
			$stmt = $this->mysqli->prepare($queryStr);
			if (!$stmt) {
				error_log("KeyValueStore.getPath($path,$key) error 2:".$this->mysqli->error);
			}
			$stmt->bind_param("s", $path);
		}
		
		if ($this->debug) {
			error_log($queryStr);
		}
		
		$stmt->execute();
		$stmt->store_result();
		
		if ($stmt->num_rows == 0) {
			return null;
		}
		
		$stmt->bind_result($rKey, $rValue);
		
		$resp = array();
		while ($stmt->fetch()) {
			$resp[$rKey] = $rValue;
		}
		
		return $resp;
	}
	
	/**
	 * Sets preferences
	 * 
	 * @param prefsPath
	 * @param key
	 * @return boolean, false if failed, true if succeeded
	 */
	public function put($path, $filter, $prefsMap) {
		if (empty($prefsMap)) {
			error_log("KeyValueStore.put($path,$filter,$prefsMap)#1: Empty prefToPut");
			return false;
		}
		
		$delete = $this->mysqli->prepare("delete from ".$this->table." where userid = ".$this->userid." and path=? and ".$this->table.".key=?");
		$insert = $this->mysqli->prepare("insert into ".$this->table." (userid,path,".$this->table.".key,value) values (?,?,?,?)");
		if (! empty($filter)) {
			$keyValue  = $prefsMap[$filter];
			if (empty($keyValue)) {
				error_log("KeyValueStore.put($path,$filter,$prefsMap)#2: Empty keyValue");
				return false;
			}
			$delete->bind_param("ss", $path, $filter);
			$delete->execute();
			$insert->bind_param("ssss",$this->userid, $path, $filter, $keyValue);
			$insert->execute();
		} else {
			foreach ($prefsMap as $pkey => $pvalue) {
				$delete->bind_param("ss", $path, $pkey);
				$delete->execute();
				$insert->bind_param("ssss", $this->userid, $path, $pkey, $pvalue);
				$insert->execute();
			}
		}
		
		return true;
	}
	
	/**
	 * Deletes preferences 
	 * 
	 * @param prefsPath
	 * @param key
	 * @return boolean always true
	 */
	public function delete($path, $key) {
		if (empty($key)) {
			$queryStr = "delete from ".$this->table." where userid = ".$this->userid." and path = ?";
			$delete = $this->mysqli->prepare($queryStr);
			$delete->bind_param("s", $path);
			$delete->execute();
			
			
		} else {
			$queryStr = "delete from ".$this->table." where userid = ".$this->userid." and path = ? and prefs.key= ?";
			$delete = $this->mysqli->prepare($queryStr);
			$delete->bind_param("ss", $path, $key);
			$delete->execute();
		}
		
		return true;
	}
}

?>