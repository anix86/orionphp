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
	 * @param unknown_type $mysql
	 * @return map
	 */
	public function getPath($path, $key) {
		if (empty($key)) {
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
	 * @param mysql
	 * @return boolean, false if failed, true if succeeded
	 */
	public function put($prefsPath, $filter, $prefsToPut) {
		if (empty($prefsToPut)) {
			error_log("KeyValueStore.put($prefsPath,$filter,$prefsToPut)#1: Empty prefToPut");
			return false;
		}
		
		$queryStr = "insert into ".$this->table." (path,".$this->table.".key,value) values (?,?,?)";
		if (! empty($filter)) {
			$keyValue  = $prefsToPut[$filter];
			if (empty($keyValue)) {
				error_log("KeyValueStore.put($prefsPath,$filter,$prefsToPut)#2: Empty keyValue");
				return false;
			}
			$queryStr .= "(\"".$prefsPath."\",\"".$filter."\",\"".$keyValue."\")";
		} else {
			$isFirst = true;
			foreach ($prefsToPut as $pkey => $pvalue) {
				$queryStr .= ($isFirst) ? "" : ", ";
				$queryStr .= "(\"".$prefsPath."\",\"".$pkey."\",\"".$pvalue."\")";
				$isFirst = false;
			}
		}
		
		if ($this->debug) {
			error_log($queryStr);
		}
		
		$qry = mysql_query($queryStr) or die(mysql_error()); // error
		return true;
	}
	
	/**
	 * Deletes preferences 
	 * 
	 * @param prefsPath
	 * @param key
	 * @return boolean always true
	 */
	public function delete($prefsPath, $key) {
		if (empty($key)) {
			$queryStr = "delete from ".$this->table." where path = \"" . $prefsPath. "\"";
		} else {
			$queryStr = "delete from ".$this->table." where path = \"" . $prefsPath. "\" and prefs.key=\"".$key."\"";
		}
		
		if ($this->debug) {
			error_log($queryStr);
		}
		
		$qry = mysql_query($queryStr) or die(mysql_error()); // error
		
		return true;
	}
}

?>