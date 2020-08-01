// https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
// https://bl.ocks.org/mbostock/5649592

charts.chart3 = function() {

// initialise layout variables
var margin = {top: 40, right: 20, bottom: 60, left: 60};
var width = 600;
var height = 400;

// initialise scale functions
var x = d3.scaleTime().range([0, width]);
var x2 = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// parse date / time
var strictIsoParse = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');
// format date / time
var hourFormat = d3.utcFormat('%H %p');

// initialise charts
var svg = d3.select('#svg3')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// get data
var url = 'data/output-grouped-times-filtered-squares-hourly.json';
d3.cachedJson(url, 'chart3', function(data) {
  // parse time to native js date
  data.forEach(function(d) {
    d.time = strictIsoParse(d.time_display);
    d.hour = hourFormat(d.time);
  });

  // draw data
  draw(data);
  
  // register filter events
  d3.selectAll('.chart3 .panel input')
  .on('change', function() {
    draw(data);
  });
});

// draw data
function draw(data) {
  // var beginTime = data[0].time;
  // var endTime = data[data.length-1].time;
  // console.log(beginTime, endTime, hourFormat(beginTime), hourFormat(endTime))

  // scale the range of the data
  x.domain(
    d3.extent(data, function(d) { return d.time; })
  );
  x2.domain(
    d3.extent(data, function(d) { return d.time; })
  );
  y.domain(
    [0, d3.max(data, function(d) { return d.internet_traffic; })]
  );

  // add axis
  svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.axisBottom(x).tickFormat(hourFormat)
    );
  svg.append('g')
    .attr('transform', 'translate(0,' + (height+8) + ')')
    .call(
      d3.axisBottom(x2).tickFormat(d3.timeFormat('%a'))
    );
  svg.append('g')
    .call(
      d3.axisLeft(y).tickFormat(d3.format('.2s'))
    );
  
  // add axis label
  svg.append('text')
    .attr('transform', 'translate(' + (width/2.5) + ',' + (height+45) + ')')
    .text('Hours of Week');
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dx', '-15em')
    .attr('dy', '-2.5em')
    .text('Activity');

  // draw legend
  drawLegend();

  // draw by square
  svg.selectAll('path').remove();
  drawPath(data, x, y, '4259', d3.schemeCategory10[0]);
  drawPath(data, x, y, '5060', d3.schemeCategory10[1]);
  drawPath(data, x, y, '4456', d3.schemeCategory10[7]);
  drawPath(data, x, y, '4703', d3.schemeCategory10[2]);

  svg.selectAll('g.annotation').remove();
}

// draw all legends on top
function drawLegend() {
  var x = 80;
  var y = -20;
  var legend = svg.append('g');

  legend.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', '15')
    .attr('height', '15')
    .style('fill', d3.schemeCategory10[0])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+13)
    .text('University');

  x += 100;
  legend.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', '15')
    .attr('height', '15')
    .style('fill', d3.schemeCategory10[1])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+13)
    .text('Downtown');

  x += 100;
  legend.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', '15')
    .attr('height', '15')
    .style('fill', d3.schemeCategory10[7])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+13)
    .text('Nightlife');

  x += 100;
  legend.append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', '15')
    .attr('height', '15')
    .style('fill', d3.schemeCategory10[2])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+13)
    .text('Forest');
}

// draw different type of data as line chart
function drawPath(data, x, y, type, color) {
  var typeFilterChecked = d3.select('.chart3 input.t-' + type).property('checked');
  var filteredData = data.filter(function(d) {
    return typeFilterChecked && d['square_id'] == type;
  })

  var line = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d['internet_traffic']); });
  svg.selectAll('path.t' + type)
    .data([filteredData])
    .enter()
    .append('path')
    .classed('t'+type, true)
    .style('fill', 'none')
    .style('stroke', color)
    .style('stroke-width', '2')
    .attr('d', line)
    .call(transition);
}

function transition(path) {
  path.transition()
    .duration(7000)
    .attrTween("stroke-dasharray", tweenDash)
    .transition()
    .on('end', function(e) {
      drawAnnotation();
    });
}

function tweenDash() {
  var l = this.getTotalLength();
  var i = d3.interpolateString("0," + l, l + "," + l);
  return function (t) { return i(t); };
}

function drawAnnotation() {
  var universityFilterChecked = d3.select('.chart3 input.t-4259').property('checked');
  if (!universityFilterChecked) {
    return;
  }

  var annotation = svg.append('g')
    .classed('annotation', true);
  annotation.append('text')
    .attr('x', 130)
    .attr('y', 390)
    .classed('annotation', true)
    .text('Activities drops significantly at university during weekend');
  annotation.append('rect')
    .attr('x', 30)
    .attr('y', 320)
    .attr('width', 50)
    .attr('height', 50)
    .classed('annotation', true);
  annotation.append('rect')
    .attr('x', 550)
    .attr('y', 280)
    .attr('width', 50)
    .attr('height', 50)
    .classed('annotation', true);
  annotation.append("line")
    .attr("x1", 30+50)
    .attr("y1", 320+50)
    .attr("x2", 130)
    .attr("y2", 390-10)
    .classed('annotation', true);
  annotation.append("line")
    .attr("x1", 500)
    .attr("y1", 390)
    .attr("x2", 550+25)
    .attr("y2", 280+50)
    .classed('annotation', true);
}

/*
IF ([square_id] == 4259) THEN "University"
ELSEIF ([square_id] == 5060) THEN "Downtown"
ELSEIF ([square_id] == 4456) THEN "Nightlife"
ELSEIF ([square_id] == 4703) THEN "Forest"
END
*/

}
