(function($) {

	var MainView = Backbone.View.extend({

		data: null,

		el: $('body'), 

		initialize: function () {

			// var success = ;

			d3.json("topics.json", _.bind(function (error, json) {
		  	
				  	if (error) {
				  		return console.warn(error);
				  	}

				  	data = json.topics;
				  	this.renderCloud(json.topics);

				}, this)
			);
		},

		renderCloud: function (topics) {

			var volumes = topics.map(function (d) { return Math.log(d.volume); });
			var volumeMax = d3.max(volumes),
				volumeMin = d3.min(volumes);
			var fontSizeScale = d3.scale.linear()
		        .domain([0, (volumeMax - volumeMin)])
		        .range([0, 6]);
			var size6Levels = function (d) {
				
				return 10 + Math.floor(fontSizeScale(Math.log(d.volume) - volumeMin)) * 10;
			};

			var dim = this.pickWidthHeight();
			var fill = this.fillRedGreenGrey();
			var size = this.size6Levels();

			var layout = d3.layout.cloud()
			    .size([dim.width, dim.height])
			    .words(topics.map(function (d) {
			    	return { 
			    		text: d.label, 
			    		size: size6Levels(d), 
			    		colour: fill(d)
			    	};
			    }))
			    .padding(5)
			    .rotate(function () { return 0; })
			    .font("Impact")
			    .fontSize(function (d) { return d.size; })
			    .on("end", drawCloudWords);

			layout.start();

			// Uses layout, fill, words
			function drawCloudWords (words, something) {
				console.log(words, something, layout.size()[0], layout.size()[1]);

				d3.select("#cloud-container svg").remove()
				d3.select("#cloud-container").append("svg")
				    .attr("width", layout.size()[0])
				    .attr("height", layout.size()[1])
				.append("g")
				    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
				.selectAll("text")
				    .data(words)
				.enter().append("text")
				    .style("font-size", function (d) { return d.size + "px"; })
				    .style("font-family", "Impact")
				    .style("fill", function (d) { return d.colour; })
				    .attr("text-anchor", "middle")
				    .attr("transform", function (d) {
				      	return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				    })
				    .text(function (d) { return d.text; });
			}
		},

		pickWidthHeight: function () {
			// Constants
			var max_w = 1200,
				min_w = 500,
				max_h = 800
				min_h = 500;

			// Current window (inner) dimensions
			var win_w = window.innerWidth,
				win_h = window.innerHeight;

			var w = win_w * 0.9,
				h = win_w * 0.66;

			if (w < min_w) {
				w = min_w;
			} else if (w > max_w) {
				w = max_w;
			}
			if (h < min_h) {
				h = min_h;
			} else if (h > max_h) {
				h = max_h;
			}

			return { width: w, height: h };
		},

		fillRedGreenGrey: function (d) {
			if (d.sentimentScore > 60) {
				return "green";
			}
			if (d.sentimentScore < 40) {
				return "red";
			}
			return "grey";
		}

	});

	// Create one of these views here, since we're not waiting for anything and it's the main view.
	var mainView = new MainView();

}) (jQuery);