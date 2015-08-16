(function($) {

	var MainView = Backbone.View.extend({

		data: null,
		layout: null,
		panel_template: null,

		el: $('body'),

		initialize: function () {

			d3.json("topics.json", _.bind(function (error, json) {
		  	
				  	if (error) {
				  		return alert(error);
				  	}

				  	this.data = json.topics;

				  	var panel_template_file = 'html/panel.html';
				  	$.ajax({
				  		url: panel_template_file,
				  		method: 'GET',
				  		success: _.bind(function (data) {

				  			this.panel_template = data;

						  	this.renderCloud();
						  	
							$(window).on('resize', _.bind(function () {
								if (window.innerWidth >= 500 || window.innerHeight >= 550) {
									this.renderCloud();
								}
							}, this));
							$(window).on('resize', _.bind(function () {
								if (window.innerWidth >= 500 || window.innerHeight >= 550) {
									this.repositionPanel();
								}
							}, this));

				  		}, this)
				  	})

				}, this)
			);

			$('.draggablePanel').draggable({ handle: '.panel-heading' });
		},

		renderCloud: function () {

			var volumes = this.data.map(function (d) { return Math.log(d.volume); });
			var volumeMax = d3.max(volumes);
			var volumeMin = d3.min(volumes);
			var fontSizeScale = d3.scale.linear()
		        .domain([0, (volumeMax - volumeMin)])
		        .range([0, 6]);
			var size6Levels = function (d) {
				return 20 + Math.floor(fontSizeScale(Math.log(d.volume) - volumeMin)) * 7;
			};

			var dim = this.pickWidthHeight();
			var fill = this.fillRedGreenGrey;

			this.layout = d3.layout.cloud()
			    .size([dim.width, dim.height])
			    .words(this.data.map(function (d) {
			    	return { 
			    		text: d.label, 
			    		size: size6Levels(d), 
			    		colour: fill(d),
			    		topic_metadata: {
			    			volume: d.volume,
			    			sentiment: d.sentiment
			    		}
			    	};
			    }))
			    .padding(5)
			    .rotate(0)
			    .font("Impact")
			    .fontSize(function (d) { return d.size; })
			    .on("end", _.bind(this.drawCloudWords, this));

			this.layout.start();
		},

		drawCloudWords: function (words) {

			var updatePanel = _.bind(this.updatePanel, this);

			d3.select("#cloud-container svg").remove()
			d3.select("#cloud-container").append("svg")
			    .attr("width", this.layout.size()[0])
			    .attr("height", this.layout.size()[1])
			.append("g")
			    .attr("transform", "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")")
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
			    .on("mouseover", function (d) { 
			    	updatePanel(d.topic_metadata);
			    	d3.select("text.glow").classed("glow", false);
			    	d3.select(this).classed("glow", true);
			    })
			    .text(function (d) { return d.text; });
		},

		pickWidthHeight: function () {
			// Constants
			var max_w = 1200,
				min_w = 500,
				max_h = 600
				min_h = 400;

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
		},

		updatePanel: function (data) {
			var template = _.template(this.panel_template);
			var template_data = { topic: data };
			$("#topic-metadata .panel-body").html(template(template_data));
		},

		repositionPanel: function () {
			var panel = $("#topic-metadata");
			var panel_position = $(panel).position();
			panel_position.right = panel_position.left + $(panel).width();
			panel_position.bottom = panel_position.top + $(panel).height();

			if (panel_position.right > window.innerWidth) {
				$(panel).css('left', 'auto');
				$(panel).css('right', '15px');
			}
			if (panel_position.left < 0) {
				$(panel).css('right', 'auto');
				$(panel).css('left', '15px');
			}
			if (panel_position.bottom > window.innerHeight) {
				$(panel).css('top', 'auto');
				$(panel).css('bottom', '15px');
			}
			if (panel_position.top < 0) {
				$(panel).css('bottom', 'auto');
				$(panel).css('top', '15px');
			}
		}

	});

	var mainView = new MainView();

}) (jQuery);