<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

/**
 * 
 * TODO switch to mysqli
 *
 */

class TreeStore {

	private $mysql;
	
	private $debug = false;
	
	public function TreeStore($mysql) {
		$this->mysql = $mysql;
		$this->initStore();
	}
	
	private function initStore() {
		mysql_query("CREATE TABLE IF NOT EXISTS `children` (`parent` int(11) DEFAULT NULL,`child` int(11) NOT NULL,KEY `parent` (`parent`) )", $this->mysql);
		mysql_query("CREATE TABLE IF NOT EXISTS `ids` (`id` int(11) NOT NULL AUTO_INCREMENT,PRIMARY KEY (`id`))", $this->mysql);
		mysql_query("CREATE TABLE IF NOT EXISTS `meta` (  `id` int(11) NOT NULL,  `key` varchar(255) NOT NULL,  `value` varchar(255) NOT NULL,  KEY `id` (`id`))", $this->mysql); 
	}
	
	public function getChildren($id) {
		$queryStr = "select c.child, m.key, m.value from children c, meta m where c.parent ".(empty($id)? "is null" : "=$id")." and c.child=m.id";
		if ($this->debug) {
			echo $queryStr;
		}
		$qry = mysql_query($queryStr, $this->mysql);
		$c = mysql_num_rows($qry);
		$children = array();
		for ($i = 0; $i < $c; $i++) {
			$row = mysql_fetch_assoc($qry);
			$children[$row["child"]][$row["key"]] = $row["value"];
		}
		
		return $children;
	}
	
	public function getChildrenDeep($id, $depth) {
		
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param $id
	 * @return childId
	 */
	public function addChild($parent, $map) {
		$qry = mysql_query("insert into ids values (null)", $this->mysql);
		$id = mysql_insert_id();
		if (empty($parent)) {
			$parent = "null";
		}
 		$queryStr = "insert into children (parent, child) values ($parent,$id)";
		if ($this->debug) {
			echo $queryStr;
		}
		$qry = mysql_query($queryStr, $this->mysql);
		
		$this->setProperties($id, $map);
		
		return $id;
	}
	
	public function delete($id) {
		mysql_query("delete from children where child=$id", $this->mysql);
		$this->deleteProperties($id);
	}
	
	public function deleteChild($parent, $child) {
		mysql_query("delete from children where parent ".(empty($parent)? "is null" : "=$parent")." and child=$child", $this->mysql);
		$this->deleteProperties($child);
	}
	
	public function deleteChildren($parent) {
		mysql_query("delete from children where parent ".(empty($parent)? "is null" : "=$parent"), $this->mysql);
		$this->deleteProperties($parent);
		// TODO leaves some dangling properties for removed children
	}
	
	public function deleteDeep($id) {
		
	}
	
	public function getProperties($id) {
		$qry = mysql_query("select * from meta where id".(empty($id)? "is null" : "=$id"), $this->mysql);
		$c = mysql_num_rows($qry);
		$props = array();
		for ($i = 0; $i < $c; $i++) {
			$row = mysql_fetch_assoc($qry);
			$props[$row["key"]] = $row["value"];
		}
		
		return $props;
	}
	
	public function setProperties($id, $map) {
		$queryStr = "insert into meta (id,meta.key,value) values";
		
		$isFirst = true;
		foreach ($map as $pkey => $pvalue) {
			$queryStr .= ($isFirst) ? "" : ", ";
			$queryStr .= "($id,\"$pkey\",\"$pvalue\")";
			$isFirst = false;
		}
		
	
		if ($this->debug) {
			echo $queryStr;
		}
		
		$qry = mysql_query($queryStr, $this->mysql);
	}
	
	public function setProperty($id, $key, $value) {
		$this->setProperties($id, array($key=>$value));
	}
	
	public function deleteProperties($id) {
		$queryStr = "delete from meta where id=$id";
		mysql_query($queryStr, $this->mysql);
	}
	
	public function deleteProperty($id, $key) {
		$queryStr = "delete from meta where id=$id and meta.key=\"$key\"";
		mysql_query($queryStr, $this->mysql);
	}
	
	public function updateProperties($id, $map) {
		foreach ($map as $key => $value) {
			$this->updateProperty($id, $key, $value);
		}
	}
	
	public function updateProperty($id, $key, $value) {
		$queryStr = "update table meta set value=\"$value\" where id=$id and meta.key=\"$key\"";
		mysql_query($queryStr, $this->mysql);
	}
}

?>