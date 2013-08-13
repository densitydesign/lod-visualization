'use strict';

/* Filters */

angular.module('myApp.filters', [])

 .filter('thumbnail', function () {
		return function (images) {
			if (!images.length) return "";
			var filtered = images.filter(function(d){ return d.subtype == "xlarge"; });
			if (!filtered.length) return "";
			return "http://nytimes.com/" + filtered[0].url;
		}
	})

 .filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });
