/*****************************************
	utilities for John
****************************************/

(function() {

	jUtils = {
    	version: "0.1"
  	};

  	// Rounds input to nearest grid multiple value
  	// used for quantization
	jUtils.roundN = function(input, grid) {
		if (grid == 0) return input
		else return Math.round(input/grid)*grid;
  };

})();