
function buildEndpointUri(cryptoc){
    var BASEURL = "https://min-api.cryptocompare.com";
    var SERVICE = "/data/histoday";
    var FSYM = cryptoc;
    var TSYM = "USD";
    var LIMIT = "60";
    var AGGREGATE = "3";
    var EXCHANGE = "Kraken";
    
    return BASEURL + SERVICE + "?fsym=" + FSYM + "&tsym=" + TSYM + "&limit=" + LIMIT + "&aggregate=" + AGGREGATE + "&e=" + EXCHANGE;
}

function transformDataFromCryptocompare2Cryptocharts(rawData){
    var cleanData = [];
    for(i=0; i<rawData.length-1;i++){
        rawEl = rawData.pop();
        var cleanEl = {
            x: new Date(rawEl.time*1000),
            y: rawEl.high
        };
        cleanData.push(cleanEl);
    }
    return cleanData;
}

function drawChart(targetName, lineData){
    var vis = d3.select('#' + targetName),
        WIDTH = 1000,
        HEIGHT = 500,
        MARGINS = {
          top: 20,
          right: 20,
          bottom: 20,
          left: 50
        },
    xRange = d3.time.scale().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
      return d.x;
    }), d3.max(lineData, function(d) {
      return d.x;
    })]),
    yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function(d) {
      return d.y;
    }), d3.max(lineData, function(d) {
      return d.y;
    })]),
    xAxis = d3.svg.axis()
      .scale(xRange)
      .tickSize(5)
      .tickSubdivide(true),
    yAxis = d3.svg.axis()
      .scale(yRange)
      .tickSize(5)
      .orient('left')
      .tickSubdivide(true);

    vis.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
      .call(xAxis);

    vis.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
      .call(yAxis);
    
    var lineFunc = d3.svg.line()
      .x(function(d) {
        return xRange(d.x);
      })
      .y(function(d) {
        return yRange(d.y);
      })
      .interpolate('linear');
    
    vis.append('svg:path')
      .attr('d', lineFunc(lineData))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
}

function buildChart(targetName, endpointUri){
    $.ajax({
        type: 'GET',
        url: endpointUri,
        contentType: 'application/json; charset=utf-8',
        success: function(resultData) {
            var krakenData = resultData;
            lineData = transformDataFromCryptocompare2Cryptocharts(krakenData.Data);
            $("#" + targetName).empty();
            drawChart(targetName, lineData);
        },
        error : function(jqXHR, textStatus, errorThrown) {
            console.log("problem dowloading data");
        },
        timeout: 120000
    });
}