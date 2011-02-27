<?php
/**
 * Copyright (c) 2011 jacek.pospychala@gmail.com
 */


class TreeStore {

	/**
	 * @var mysqli
	 */
	private $mysqli;
	
	private $debug = false;
	
	public function TreeStore($mysqli) {
		$this->mysqli = $mysqli;
		$this->initStore();
	}
	
	private function initStore() {
		$this->mysqli->query("CREATE TABLE IF NOT EXISTS `children` (`parent` int(11) DEFAULT NULL,`child` int(11) NOT NULL,KEY `parent` (`parent`) )", $this->mysql);
		$this->mysqli->query("CREATE TABLE IF NOT EXISTS `ids` (`id` int(11) NOT NULL AUTO_INCREMENT,PRIMARY KEY (`id`))", $this->mysql);
		$this->mysqli->query("CREATE TABLE IF NOT EXISTS `meta` (  `id` int(11) NOT NULL,  `key` varchar(255) NOT NULL,  `value` varchar(255) NOT NULL,  KEY `id` (`id`))", $this->mysql); 
	}
	
	public function getChildren($id) {
		if (empty($id)) {
			$queryStr = "select c.child, m.key, m.value from children c, meta m where c.parent is null and c.child=m.id";
			$stmt = $this->mysqli->prepare($queryStr);
		} else {
			$queryStr = "select c.child, m.key, m.value from children c, meta m where c.parent = ? and c.child=m.id";
			$stmt = $this->mysqli->prepare($queryStr);
			$stmt->bind_param("i", $id);
		}
		
		if (!$stmt->execute()) {
			return false;
		}
		
		$stmt->bind_result($childId, $rowKey, $rowValue);
		
		$children = array();
		while ($stmt->fetch()) {
			$children[$childId][$rowKey] = $rowValue;
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
		$this->mysqli->query("insert into ids values (null)");
		$id = $this->mysqli->insert_id;
		
		$stmt = $this->mysqli->prepare("insert into children (parent, child) values (?,?)");
		if (empty($parent)) {
			$parent = null;
		}
		$stmt->bind_param("ii", $parent, $id);
		if (!$stmt->execute()) {
			return false;
		}
		
		$this->setProperties($id, $map);
		
		return $id;
	}
	
	public function delete($id) {
		$stmt = $this->mysqli->prepare("delete from children where child=?");
		$stmt->bind_param("i", $id);
		if (!$stmt->execute()) {
			return false;
		}
		
		$this->deleteProperties($id);
	}
	
	public function deleteChild($parent, $child) {
		if (empty($parent)) {
			$stmt = $this->mysqli->prepare("delete from children where parent is null and child=?");
			$stmt->bind_param("i", $child);
		} else {
			$stmt = $this->mysqli->prepare("delete from children where parent = ?  and child=?");
			$stmt->bind_param("ii", $parent, $child);
		}
		
		if (!$stmt->execute()) {
			return false;
		}
		
		$this->deleteProperties($child);
	}
	
	public function deleteChildren($parent) {
		if (empty($parent)) {
			$stmt = $this->mysqli->prepare("delete from children where parent is null");
		} else {
			$stmt = $this->mysqli->prepare("delete from children where parent = ?");
			$stmt->bind_param("i", $parent);
		}
		
		if (!$stmt->execute()) {
			return false;
		}
		
		$this->deleteProperties($parent);
		// TODO leaves some dangling properties for removed children
	}
	
	public function deleteDeep($id) {
		
	}
	
	public function getProperties($id) {
		if (empty($id)) {
			$stmt = $this->mysqli->prepare("select meta.key, meta.value from meta where id is null");
		} else {
			$stmt = $this->mysqli->prepare("select meta.key, meta.value from meta where id = ?");
			$stmt->bind_param("i", $id);
		}
		
		if (!$stmt->execute()) {
			return false;
		}
		
		$props = array();
		$stmt->bind_result($rowKey, $rowValue);
		while ($stmt->fetch()) {
			$props[$rowKey] = $rowValue;
		}
		
		return $props;
	}
	
	public function setProperties($id, $map) {
		$stmt = $this->mysqli->prepare("insert into meta (id,meta.key,value) values (?,?,?)");
		
		foreach ($map as $pkey => $pvalue) {
			$stmt->bind_param("iss", $id, $pkey, $pvalue);
			$stmt->execute();
		}
	}
	
	public function setProperty($id, $key, $value) {
		$this->setProperties($id, array($key=>$value));
	}
	
	public function deleteProperties($id) {
		$stmt = $this->mysqli->prepare("delete from meta where id=?");
		$stmt->bind_param("i", $id);
		return $stmt->execute();
	}
	
	public function deleteProperty($id, $key) {
		$stmt = $this->mysqli->prepare("delete from meta where id=? and meta.key=?");
		$stmt->bind_param("is", $id, $key);
		return $stmt->execute();
	}
	
	public function updateProperties($id, $map) {
		foreach ($map as $key => $value) {
			$this->updateProperty($id, $key, $value);
		}
	}
	
	public function updateProperty($id, $key, $value) {
		$stmt = $this->mysqli->prepare("update table meta set value=? where id =? and meta.key=?");
		$stmt->bind_param($value, $id, $key);
		return $stmt->execute();
	}
}

?>