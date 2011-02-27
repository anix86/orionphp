<?php

include_once 'TreeStore.php';
include_once 'TestUnit.php';

class TreeStoreTest {
	
	/**
	 * @var TreeStore
	 */
	private $store;
	
	public function TreeStoreTest($mysqli) {
		$this->store = new TreeStore($mysqli);
	}
	
	public function testAddChild() {
		$id = $this->store->addChild(534, array("k"=> "v"));
		
		TestUnit::assertTrue("notEmpty", !empty($id));
		
		$props = $this->store->getProperties($id);
		TestUnit::assertSame("k=v", "v", $props["k"]);
		TestUnit::assertSame("size=1", 1, count($props));
	}
	
	public function testSetProperties() {
		$this->store->setProperties(534, array("Name" => "Jane's", "Color" => "Vilet Blue #FF0000 \"Navy\""));
		
		$map = $this->store->getProperties(534);
		TestUnit::assertSame("NameIsSame", "Jane's", $map["Name"]);
		TestUnit::assertSame("ColorIsSame", "Vilet Blue #FF0000 \"Navy\"", $map["Color"]);
		
	}
	
	public function testDelete() {
		$props = $this->store->getProperties(534);
		TestUnit::assertTrue("notEmpty", !empty($props));
		
		$this->store->delete(534);
		
		$props = $this->store->getProperties(534);
		TestUnit::assertTrue("isEmpty",empty($props));
	}
}

TestUnit::test(new TreeStoreTest($mysqli));