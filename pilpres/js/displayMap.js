// Global variables declaration
var data;
var tempCol = [];
var minmax;
var q;


// Set svg map size
var width = 800,
    height = 300;
// Set svg plot size
var dwidth = 300, 
    dheight = 250;
// Set padding, used for svg graph
var padding = {
    x: 40,
    y: 40
};

// Map projection, viewbox focus on Indonesia
var projection = d3.geo.mercator()
    .scale(1000)
    .translate([-1650,120]);

// Create svgmap as a reference of svg map element
var svgmap = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define path based on the projection
var path = d3.geo.path()
    .projection(projection);

var g = svgmap.append("g");


//-----------------------------
// Load CSV for map, and quantize the data
//-------------------------------
d3.csv("dataset/pilpresdata.csv",function(dataloaded){
  dataloaded.map(function(d){
    tempCol.push(d['warna']);
  });
  
  //tempCol.splice(tempCol.indexOf("-"),1);

  // minmax = d3.extent(tempCol);
  // // scale the data
  // q = d3.scale.quantize()
  //   .domain(minmax)
  //   .range(colorbrewer.Reds[9]);

  data = dataloaded;
});
//------------------------------
//------------------------------

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


//---------------------------------
// Load JSON data to construct the map
//-------------------------------
d3.json("js/provinsi.json", function(error, topology) {
    g.selectAll("path")
      .data(topojson.feature(topology, topology.objects.map)
          .features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill",function(d){
        try{
          return data[prov2id(d.properties.id_provinsi)]['warna'];
        }catch{
          return '#ffffff';
        }
        
      })

      .on("click",function(d){
        // d3.select("#bigProv").html(data[prov2id(d.properties.id_provinsi)]['provinsi']);
      })
      .on("mousedown",function(d){
      	d3.select(this)
      	.style('stroke','#bbb');
      }) 
      .on("mouseup",function(d){
      	d3.select(this)
      	.style('stroke','black');
      })     
      .on("mouseover",function(d){
        htmldata = data[prov2id(d.properties.id_provinsi)]['prov.asli']+"<br>"+ data[prov2id(d.properties.id_provinsi)]['capres'] + " : " + data[prov2id(d.properties.id_provinsi)]['persen'] + " %";
        
        div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(htmldata)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");		

        d3.select(this)
      			.style('stroke-width','2px')
      			.style("cursor",'pointer');
      	
      })
      .on("mouseout",function(d){
      		d3.selectAll('path')
            .style('stroke-width','1px');
            
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
      		
      })
      // d3.select("#bigProv").html(data[prov2id(34)]['provinsi']);
      // drawPlot(prov2id(34));
      // displayRadarChart(prov2id(34));
		
});
//--------------------------------------------
//-------------------------------------------