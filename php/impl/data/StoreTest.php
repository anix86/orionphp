<?php

include 'TestUnit.php';
include 'Store.php';

class StoreTest {
	
	/**
	 * @var Store
	 */
	private $store;
	
	public function StoreTest($mysqli) {
		$this->store = new Store($mysqli);
	}
	
	public function test1() {
		$this->store->set(500, "some value");
		$value = $this->store->get(500);
		
		TestUnit::assertSame("test1", "some value", $value);
	}
	
	public function testQuotes() {
		$this->store->set(500, "some \"quoted\" value");
		$value = $this->store->get(500);
		
		TestUnit::assertSame("test1", "some \"quoted\" value", $value);
	}
	
	public function testDelete() {
		$value = $this->store->get(500);
		TestUnit::assertTrue("test2", !empty($value));
		
		$this->store->delete(500);
		$value = $this->store->get(500);
		
		TestUnit::assertSame("test2", false, $value);
	}
}

TestUnit::test(new StoreTest($mysqli));