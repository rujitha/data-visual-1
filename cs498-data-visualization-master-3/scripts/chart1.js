// https://codepen.io/MichaelWStuart/pen/Xpmbyq?editors=0110
// https://bl.ocks.org/d3noob/6f082f0e3b820b6bf68b78f2f7786084
// https://bl.ocks.org/mbostock/5537697

charts.chart1 = function() {

// initialise layout variables
var margin = {top: 50, right: 20, bottom: 50, left: 60};
var width = 600;
var height = 400;

// initialise scale functions
var x = d3.scaleTime().range([0, width]);
var x2 = d3.scaleTime().range([0, width]);
var y = d3.scaleLog().range([height, 0]);

// parse date / time
var strictIsoParse = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');
// format date / time
var hourFormat = d3.utcFormat('%H %p');

// initialise charts
var svg = d3.select('#svg1')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// get data
var url = 'data/output-grouped-times.json';
d3.cachedJson(url, 'chart1', function(data) {
  // parse time to native js date
  data.forEach(function(d) {
    d.time = strictIsoParse(d.time_display);
    d.hour = hourFormat(d.time);
  });

  // draw data
  draw(data);
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
    [
      d3.min(data, function(d) { return d.call_all; }),
      d3.max(data, function(d) { return d.internet_traffic; })
    ]
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

  // draw internet traffic, sms and call
  drawCircle(data, 'internet_traffic', d3.schemeCategory10[0]);
  drawCircle(data, 'sms_all', d3.schemeCategory10[1]);
  drawCircle(data, 'call_all', d3.schemeCategory10[2]);

  // draw annotation
  drawAnnotation();
}

// draw all legends on top
function drawLegend() {
  var x = 150;
  var y = -30;
  var legend = svg.append('g');

  legend.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', '5')
    .style('fill', d3.schemeCategory10[0])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+5)
    .text('Internet');

  x += 100;
  legend.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', '5')
    .style('fill', d3.schemeCategory10[1])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+5)
    .text('SMS');

  x += 100;
  legend.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', '5')
    .style('fill', d3.schemeCategory10[2])
  x += 20;
  legend.append('text')
    .attr('x', x)
    .attr('y', y+5)
    .text('Call');
}

// draw different type of data as scatterplot
function drawCircle(data, type, color) {
  svg.selectAll('circle.' + type)
    .data(data)
    .enter()
    .append('circle')
      .classed(type, true)
      .attr('r', 2)
      .style('fill', color)
      .style('opacity', 0.8)
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d[type]); });
}

function drawAnnotation() {
  var annotation = svg.append('g');
  annotation.append('text')
    .attr('x', 60)
    .attr('y', 370)
    .classed('annotation', true)
    .text('Call drops significantly at night, especially during week days');
  annotation.append('rect')
    .attr('x', 60)
    .attr('y', 380)
    .attr('width', 400)
    .attr('height', 20)
    .classed('annotation', true);
}

}
