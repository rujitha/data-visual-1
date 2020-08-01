// https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4

charts.chart2 = function() {

// initialise layout variables
var margin = {top: 40, right: 20, bottom: 60, left: 60};
var width = 600;
var height = 400;

// initialise scale functions
var x = d3.scaleTime().range([0, width + margin.right]);
var y = d3.scaleLinear().range([height, 0]);

// parse date / time
var strictIsoParse = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');
// format date / time
var hourFormat = d3.utcFormat('%H %p');

// initialise charts
var svg = d3.select('#svg2')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// get data
var url = 'data/output-grouped-times-hourly.json';
d3.cachedJson(url, 'chart2', function(data) {
  // take records from only 1 day
  data = data.slice(0, 24);
  // parse time to native js date
  data.forEach(function(d) {
    d.time = strictIsoParse(d.time_display);
    d.hour = hourFormat(d.time);
  });

  // draw data
  draw(data);

  // draw annotation
  drawAnnotation();

  // register filter events
  d3.selectAll('.chart2 .panel input')
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
    .call(
      d3.axisLeft(y).tickFormat(d3.format('.2s'))
    );
  
  // add axis label
  svg.append('text')
    .attr('transform', 'translate(' + (width/2.5) + ',' + (height+margin.top) + ')')
    .text('Hours of Day');
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dx', '-15em')
    .attr('dy', '-2.5em')
    .text('Activity');

  // draw legend
  drawLegend();

  // draw internet traffic, sms and call
  svg.selectAll('rect.internet_traffic, rect.sms_all, rect.call_all').remove();
  drawRect(data, x, y, 'internet_traffic', d3.schemeCategory10[0]);
  drawRect(data, x, y, 'sms_all', d3.schemeCategory10[1]);
  drawRect(data, x, y, 'call_all', d3.schemeCategory10[2]);
}

// draw all legends on top
function drawLegend() {
  var x = 150;
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
    .text('Internet');

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
    .text('SMS');

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
    .text('Call');
}

// draw different type of data as bar chart
function drawRect(data, x, y, type, color) {
  var typeFilterChecked = d3.select('.chart2 input.' + type).property('checked');
  if (!typeFilterChecked) {
    data = [];
  }

  svg.selectAll('rect.' + type)
    .data(data)
    .enter()
    .append('rect')
      .classed(type, true)
      .attr('r', 2)
      .style('fill', color)
      .attr('x', function(d) { return x(d.time); })
      .attr('y', function(d) { return y(d[type]); })
      .attr('width', 15)
      .attr('height', function(d) { return height - y(d[type]); });
}

function drawAnnotation() {
  var annotation = svg.append('g');
  annotation.append('text')
    .attr('x', 60)
    .attr('y', 370)
    .classed('annotation', true)
    .text('Call drops significantly at night');
  annotation.append('rect')
    .attr('x', 60)
    .attr('y', 380)
    .attr('width', 150)
    .attr('height', 20)
    .classed('annotation', true);
}

}
