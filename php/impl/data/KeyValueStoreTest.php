<?php

echo "AHAAA";

include 'KeyValueStore.php';

function assertSame($msg, $expected, $actual) {
	if ($expected == $actual) {
	 echo "$msg: OK<br/>";
	} else {
		echo "$msg: Expected <$expected>, but found <$actual>.<br/>";
		exit;
	}
}


class Tests {
	
	/**
	 * @var KeyValueStore
	 */
	private $store;
	
	function Tests() {
		$mysqli = new mysqli("localhost", "root", "", "zendaurion");
		if (mysqli_connect_errno()) {
		    error_log("Connect failed: %s\n", mysqli_connect_error());
		    return;
		}
		$this->store = new KeyValueStore($mysqli, "prefs");
	}
	
	function testGet() {
		$map = $this->store->getPath("user/p", "name");
		assertSame("test1", "jacek", $map["name"]);
		
		$map = $this->store->getPath("user/p", null);
		assertSame("test1a", 4, count($map));
		assertSame("test2", "jacek", $map["name"]);
		assertSame("test3", "Babol", $map["Name"]);
		assertSame("test4", "Babol", $map["Password"]);
		assertSame("test5", "Dudek", $map["LastName"]);
	}
	
	function testPutDel() {
		$this->store->put("abc/def", null, array("key" => "value"));
		$map = $this->store->getPath("abc/def", null);
		assertSame("test6", 1, count($map));
		assertSame("test7", "value", $map["key"]);
		
		$this->store->delete("abc/def", null);
		$map = $this->store->getPath("abc/def", null);
		assertSame("test8", 0, count($map));
	}

	function testPutDelManyValues() {
		$this->store->put("abc/def/ghi", null, array("key1" => "value1", "key2" => "value2"));
		$map = $this->store->getPath("abc/def/ghi", null);
		assertSame("test6", 2, count($map));
		assertSame("test7", "value1", $map["key1"]);
		assertSame("test7a", "value2", $map["key2"]);
		
		$this->store->delete("abc/def/ghi", null);
		$map = $this->store->getPath("abc/def", null);
		assertSame("test8", 0, count($map));
	}

	function testPutDelManyValuesFilter() {
		$this->store->put("abc/def/ghi/jki", "key1", array("key1" => "value1", "key2" => "value2"));
		$map = $this->store->getPath("abc/def/ghi/jki", null);
		assertSame("test6", 1, count($map));
		assertSame("test7", "value1", $map["key1"]);
		
		$this->store->delete("abc/def/ghi/jki", null);
		$map = $this->store->getPath("abc/def", null);
		assertSame("test8", 0, count($map));
	}
	
	function runTests() {
		echo "--testGet<br/>";
		$this->testGet();
		echo "--testPutDel<br/>";
		$this->testPutDel();
		echo "--testPutDelManyValues<br/>";
		$this->testPutDelManyValues();
		echo "--testPutDelManyValuesFilter<br/>";
		$this->testPutDelManyValuesFilter();
	}
}


$t = new Tests();
$t->runTests();
