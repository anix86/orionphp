<?php


class TestUnit {

	function assertTrue($msg, $expr) {
		if (!$expr) {
			echo "- $msg: Expected true, but &lt;<pre>$expr</pre>&gt; found.<br/>";
		}
	}
	
	function assertSame($msg, $expected, $actual) {
		if ($expected == $actual) {
		} else {
			echo "- $msg: Expected &lt;<pre>$expected</pre>&gt;, but found &lt;<pre>$actual</pre>&gt;.<br/>";
		}
	}
	
	function test($target) {
		$methods = get_class_methods($target);
		foreach ($methods as $method) {
			if (substr($method, 0, 4) == "test") {
				echo get_class($target)."::".$method."()<br/>";
				call_user_func(array($target, $method));
			}
		}
	}
}