<?php

class KeyValueStore {
	
	private $table;
	
	/**
	 * @var mysqli
	 */
	private $mysqli;
	
	private $debug = true;
	
	public function KeyValueStore($mysqli, $storeName) {
		$this->table = $storeName;
		$this->mysqli = $mysqli;
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
			$queryStr = "select p.key, p.value from ".$this->table." p where p.path=? and p.key=?";
			$stmt = $this->mysqli->prepare($queryStr);
			$stmt->bind_param("ss", $path, $key);
		} else {
			$queryStr = "select p.key, p.value from ".$this->table." p where p.path=?";
			$stmt = $this->mysqli->prepare($queryStr);
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
		
		$delete = $this->mysqli->prepare("delete from ".$this->table." where path=? and ".$this->table.".key=?");
		$insert = $this->mysqli->prepare("insert into ".$this->table." (path,".$this->table.".key,value) values (?,?,?)");
		if (! empty($filter)) {
			$keyValue  = $prefsMap[$filter];
			if (empty($keyValue)) {
				error_log("KeyValueStore.put($path,$filter,$prefsMap)#2: Empty keyValue");
				return false;
			}
			$delete->bind_param("ss", $path, $filter);
			$delete->execute();
			$insert->bind_param("sss", $path, $filter, $keyValue);
			$insert->execute();
		} else {
			foreach ($prefsMap as $pkey => $pvalue) {
				$delete->bind_param("ss", $path, $pkey);
				$delete->execute();
				$insert->bind_param("sss", $path, $pkey, $pvalue);
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
			$queryStr = "delete from ".$this->table." where path = ?";
			$delete = $this->mysqli->prepare($queryStr);
			$delete->bind_param("s", $path);
			$delete->execute();
			
			
		} else {
			$queryStr = "delete from ".$this->table." where path = ? and prefs.key= ?";
			$delete = $this->mysqli->prepare($queryStr);
			$delete->bind_param("ss", $path, $key);
			$delete->execute();
		}
		
		return true;
	}
}

?>