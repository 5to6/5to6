
'use strict';

let x = "hi";
function blubber() {
	let x = "hi";
	if (x) {
		let y = "hahaha"; // we need to simulate hoisting (or leave alone);
	}
}