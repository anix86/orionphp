<?php
/**
 * Copyright (c) 2010 jacek.pospychala@gmail.com
 */

include 'TestUnit.php';
include 'KeyValueStore.php';



class KeyValueStoreTest {
	
	/**
	 * @var KeyValueStore
	 */
	private $store;
	
	function KeyValueStoreTest() {
		$mysqli = new mysqli("localhost", "root", "", "zendaurion");
		if (mysqli_connect_errno()) {
		    error_log("Connect failed: %s\n", mysqli_connect_error());
		    return;
		}
		$this->store = new KeyValueStore($mysqli, 1, "prefs");
	}
	
	function testPutDel() {
		$this->store->put("abc/def", null, array("key" => "value"));
		$map = $this->store->getPath("abc/def", null);
		TestUnit::assertSame("test6", 1, count($map));
		TestUnit::assertSame("test7", "value", $map["key"]);
		
		$this->store->delete("abc/def", null);
		$map = $this->store->getPath("abc/def", null);
		TestUnit::assertSame("test8", 0, count($map));
	}

	function testPutDelManyValues() {
		$this->store->put("abc/def/ghi", null, array("key1" => "value1", "key2" => "value2"));
		$map = $this->store->getPath("abc/def/ghi", null);
		TestUnit::assertSame("test6", 2, count($map));
		TestUnit::assertSame("test7", "value1", $map["key1"]);
		TestUnit::assertSame("test7a", "value2", $map["key2"]);
		
		$this->store->delete("abc/def/ghi", null);
		$map = $this->store->getPath("abc/def", null);
		TestUnit::assertSame("test8", 0, count($map));
	}

	function testPutDelManyValuesFilter() {
		$this->store->put("abc/def/ghi/jki", "key1", array("key1" => "value1", "key2" => "value2"));
		$map = $this->store->getPath("abc/def/ghi/jki", null);
		TestUnit::assertSame("test6", 1, count($map));
		TestUnit::assertSame("test7", "value1", $map["key1"]);
		
		$this->store->delete("abc/def/ghi/jki", null);
		$map = $this->store->getPath("abc/def", null);
		TestUnit::assertSame("test8", 0, count($map));
	}
}

TestUnit::test(new KeyValueStoreTest());

