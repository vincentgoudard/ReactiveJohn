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

  	jUtils.getRandomItems = function(arr, n) {
    	var result = new Array(n),
    	    len = arr.length,
    	    taken = new Array(len);
    	if (n > len)
    	    throw new RangeError("getRandom: more elements taken than available");
    	while (n--) {
    	    var x = Math.floor(Math.random() * len);
    	    result[n] = arr[x in taken ? taken[x] : x];
    	    taken[x] = --len in taken ? taken[len] : len;
    	}
    	return result;
	};

	jUtils.uniqueRandomNumbers = function(arr, n) {
		var arr_copy =  arr.slice(0);
		var result = new Array(n);
		for (var i = 0; i < n; i++){
          var index = Math.floor(Math.random() * arr_copy.length);
          result.push(arr_copy[index]);
          // now remove that value from the array
          arr_copy.splice(index, 1);
      }
      return result;
	}

  // format time passed in seconds as a formatted string duration
  jUtils.formatTime = function(duration){
        var durationMinutes = ("0" + Math.floor(duration / 60)).slice(-2);
        var durationSeconds = ("0" + Math.floor(duration - durationMinutes * 60)).slice(-2);
        return (durationMinutes + "'"+ durationSeconds);
  }

})();