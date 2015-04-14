
'use strict';

var x = "hi";
function blubber() {
	var x = "hi";
	if (x) {
		var y = "hahaha"; // we need to simulate hoisting (or leave alone);
	}
}