/*****************************************
	utilities
****************************************/

(function() {

	jUtils = {
    	version: "0.1"
  	};

	jUtils.roundN = function(input, grid) {
    	return Math.ceil(input/grid)*grid;
  };

})();