import * as d3 from "d3";
import * as d3_annotation from "d3-svg-annotation";
var $ = require("jquery");
require('file-loader?name=[name].[ext]!./index.html');

$(function() {
    $( "#cryptoc_list" ).change(function() {                                           
        var str = "";
        $( "#cryptoc_list option:selected" ).each(function() {
            str += $(this).val();
        });
        var endpoint_uri = buildEndpointUri(str);
        buildChart("visualisation", endpoint_uri);
    });
});


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
    for(var i=0; i<rawData.length-1;i++){
        var rawEl = rawData.pop();
        var cleanEl = {
            time: new Date(rawEl.time*1000),
            price: rawEl.high
        };
        cleanData.push(cleanEl);
    }
    return cleanData;
}

function drawChart(targetName, lineData, annotations){
    var svg = d3.select('#' + targetName),
        WIDTH = 1000,
        HEIGHT = 500,
        MARGINS = {
          top: 20,
          right: 20,
          bottom: 20,
          left: 50
        };
    var xRange = d3.scaleTime().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
        return d.time;
    }), d3.max(lineData, function(d) {
            return d.time;
    })]);
    var yRange = d3.scaleLinear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function(d) {
        return d.price;
    }), d3.max(lineData, function(d) {
        return d.price;
    })]);
    var xAxis = d3.axisBottom(xRange);
    var yAxis = d3.axisLeft(yRange);

    svg.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
      .call(xAxis);

    svg.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
      .call(yAxis);
    
    var lineFunc = d3.line()
      .x(function(d) {
        return xRange(d.time);
      })
      .y(function(d) {
        return yRange(d.price);
      });
    
    svg.append('svg:path')
      .attr('d', lineFunc(lineData))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
      
    //Add annotations
    var labels = annotations;
    var timeFormat = d3.timeFormat("%d-%b-%y");
    var parseTime = d3.timeParse("%d-%b-%y");

    window.makeAnnotations = d3_annotation.annotation().annotations(labels).type(d3_annotation.annotationCalloutCircle)
        .accessors({ 
            x: function x(d) {
                return xRange(parseTime(d.time));
            },
            y: function y(d) {
                return yRange(d.price);
            }
        }).accessorsInverse({
            time: function time(d) {
                return timeFormat(xRange.invert(d.x));
            },
            price: function price(d) {
                return yRange.invert(d.y);
            }
        });
    svg.append("g").attr("class", "annotation-test").call(makeAnnotations);
    svg.selectAll("g.annotation-connector, g.annotation-note");
}

function buildChart(targetName, endpointUri){
    $.ajax({
        type: 'GET',
        url: endpointUri,
        contentType: 'application/json; charset=utf-8',
        success: function(resultData) {
            var krakenData = resultData;
            var lineData = transformDataFromCryptocompare2Cryptocharts(krakenData.Data);
            $("#" + targetName).empty();
            drawChart(targetName, lineData, getAnnotations());
        },
        error : function(jqXHR, textStatus, errorThrown) {
            console.log("problem dowloading data");
        },
        timeout: 120000
    });
}

function getAnnotations(){
    return [{
        data: { time: "26-Aug-17", price: 3000 },
        dy: 37,
        dx: -142
    }, {
        data: { time: "26-Jul-17", price: 3000 },
        dy: -137,
        dx: 0,
        note: { align: "middle" }
    }, {
        data: { time: "18-Sep-17", price: 3000 },
        dy: 37,
        dx: 42
    }].map(function (l) {
        l.note = Object.assign({}, l.note, { title: "Price: " + l.data.price,
          label: "" + l.data.time });
        l.subject = { radius: 4 };
        return l;
    });
}
