// final_proj.js
// Take in a .csv (Comma Separated Values) file and generate a parallel coordinate plot

function main() {
   $(document).ready(function(){
      var file;
      var title;
      var reader = new FileReader();
      var labels; //indexed array for labels to records in multivariate data
      var records_raw; //array of strings representing records
      var records; //array of Record objects
      var sets; //array of labels to use as subsets; qualitative data
      var tags; //map of sets to subsets
      var data; //array of labels resenting quantitative data
      var legendLen = 0; 
      var brushed; //array of booleans indicating which polylines have been selected
      var yScales; //array of d3 linear scales for parallel axes
      
      //get data from FileReader object and parse it into appropriate data structures
      $("#Load").click(function(){
         labels = [];
         records_raw = [];
         records = [];
         sets = ["None"];
         tags = new Map();
         tags.set("None",["All"]);
         data = [];
         brushed= [];
         
         if (reader.readyState == 2){ //if file has been read into result of reader
            var input = reader.result; //get result as text
         } else { //else, the reader hasn't read the file (0) or is currently reading the file (1)
            console.log("File is not ready: readyState " + reader.readyState);
         }
         
         //Use d3 to parse the csv file, and separate into appropriate data structures
         records_raw = d3.csvParseRows(input);
         labels = records_raw[0];
         records_raw = records_raw.slice(1);
         
         //Analyze records to distinguish between qualitative and quantitative data
         //First value will be used as record name
         var i = 0 ,j = 0,k = 0;
         var str = "";
         var test;
         var set_str, set_str_split;
         var tempSet = new Set();
         var tempRecord;
         
         //create an array of Records
         for (i = 0; i < records_raw.length; i++){
            tempRecord = new Record(records_raw[i][0]);
            tempRecord.setInsert("None",["All"]);
            records.push(tempRecord);
            brushed.push(true);
         }
         
         for(i = 1; i < labels.length; i++){ //go through all labels
            str = records_raw[k][i];
            while (str == "") {
               str = records_raw[++k][i]; //iterate over records until a non-empty value is found
            }
            k=0;
            test = parseFloat(str); //try to parse this value as a number; returns NaN if it is text
            if (isNaN(test)){
               sets.push(labels[i]);
               //construct arrays containing all potential tags to be used as subsets
               for (var j = 0; j < records_raw.length; j++){
                  set_str = records_raw[j][i];
                  set_str_split = set_str.split('|');
                  for (var l = 0; l < set_str_split.length; l++){
                     if (set_str_split[l] != ""){
                        tempSet.add(set_str_split[l]);
                     }
                  }
               }
               tags.set(labels[i],Array.from(tempSet));
               for (j = 0; j < records_raw.length; j++){
                  set_str = records_raw[j][i];
                  set_str_split = set_str.split('|');
                  records[j].setInsert(labels[i],set_str_split);
               }
               tempSet.clear();
            } else {
               data.push(labels[i]);
               for (j = 0; j < records_raw.length; j++){
                  records[j].insert(labels[i],parseFloat(records_raw[j][i]));
               }
            }
         }
         
         //Add inputs dynamically as HTML elements
         $("#Selectors").empty();
         $("#SetSelectors").empty();
         $("#LegendSelectors").empty();  //clear input areas
         for (var i = 0; i < data.length; i++){
            $("#Selectors").append("<p>" +
                                   "<input class=\"w3-check w3-left\" type=\"checkbox\" id = \"cbox" + (i) + "\"" + (i<5 ? "checked=\"checked\"":"") + "\">" +
                                   "<label class=\"w3-validate\" for = \"cbox" + (i) + "\">" + data[i] + "</label>" +
                                   "</p>");
         }
         for (var i = 0; i < sets.length; i++){
            $("#SetSelectors").append("<p>" +
                                   "<input name = \"setSelecs\" class=\"w3-radio w3-left\" type=\"radio\" id = \"rad" + (i) + "\"" + (i==0 ? "checked=\"checked\"":"") + "\">" +
                                   "<label class=\"w3-validate\" for = \"rad" + (i) + "\">" + sets[i] + "</label>" +
                                   "</p>");            
         }
         var legend_tags = Array.from(tags.get(sets[0]));
         updateLegend(legend_tags);
         legendLen = legend_tags.length;
         yScales = updatePlot(records,data,sets,tags,title);
      });
      
      $("#FileInput").change(function(){
         file = $(this).prop("files")[0]; //retrieve file from list
         title = (file.name).split('.')[0];
         reader.readAsText(file); //read text file; stored in "result" property
      });
      
      $("#Selectors").change(function(){
         yScales = updatePlot(records,data,sets,tags,title);
      });
      
      $("#SetSelectors").change(function(){
         for (var i = 0; i < sets.length; i++){
            dataSel = $("#rad" + i);
            if (dataSel.prop("checked") == true){
               group = sets[i];
               break;
            }
         }   
         
         $("#LegendSelectors").empty();  
         var legend_tags = Array.from(tags.get(group));
         updateLegend(legend_tags);
         legendLen = legend_tags.length;
         updateColors(records,data,sets,tags,getBrushed(records,yScales,getActives(data,sets,tags)));
      });
      
      $("#LegendSelectors").change(function(){
         updateColors(records,data,sets,tags,getBrushed(records,yScales,getActives(data,sets,tags)));
      });
      
      $("#displayAxes").click(function(){
         $("#Selectors").toggle();
      });
      
      $("#Groups").click(function(){
         $("#SetSelectors").toggle();
      });
      
      $("#Legend").click(function(){
         $("#LegendSelectors").toggle();
      });
      
      //Use this selector to find dynamically added DOM elements
      $(document.body).on("change","#selectAll",function() {
         var checked = $(this).prop("checked");
         for (var i = 0; i < legendLen; i++){
            dataSel = $("#cbox_L" + i);
            dataSel.prop("checked", checked);
         }
         updateColors(records,data,sets,tags,getBrushed(records,yScales,getActives(data,sets,tags)))
      });
   }); 
}

function updatePlot(plot_data,data,sets,tags,title){
   var margin = {top: 25, right: 75, bottom: 75, left: 75}; //conventional margins
   var vis = d3.select("#svg");
   var width = vis.attr("width") - margin.left - margin.right;
   var height = vis.attr("height") - margin.top - margin.bottom;
   var range_Points = [];
   
   var show = getActives(data,sets,tags);
   
   //Scales and Axes
   var yScales = [];
   var yAxes = [];
   var brushes = [];
   for (var i = 0; i < data.length; i++){
      if (show.axis[i]){
         yScales.push(d3.scaleLinear()
            .domain([d3.min(plot_data, function(d){return d.find(data[i])}), d3.max(plot_data, function(d){return d.find(data[i])})])
            .range([height,0]));
         yAxes.push(d3.axisLeft(yScales[yScales.length-1]));
         brushes.push(d3.brushY()
            .extent([[-8,-1],[8,height+1]])
            .on("brush",function() {
               brushed = getBrushed(plot_data,yScales,show);
               updateColors(plot_data,data,sets,tags,brushed);
            }))
      }
   }
   var n = yAxes.length;
   for (var i = 0; i < n; i++){
      range_Points.push( (i/(n-1)) * width);
   } 
   var xScale = d3.scaleOrdinal().domain(show.data).range(range_Points);
   var xAxis = d3.axisTop(xScale)
                  .tickSize(0)
                  .tickPadding(margin.bottom+20);
   
   //Map each subset of the selected groupings to a particular color in this particular color array
   var colorScale = d3.scaleOrdinal().domain(show.subsets).range(d3.schemeCategory10);
   
   //update legend
   for (var i = 0; i < show.subsets.length; i++){
      dataSel = $("#color" + i);
      dataSel.css({"fill":colorScale(show.subsets[i]), "stroke":"black", "stroke-width":"3", "opacity":"0.7"});
   }
   
   //Erase previous content of vis
   vis.selectAll("*").remove(); 
   
   //Draw Axes
   vis.append("g") //create the group "g" and shift it over by the margin values
         .attr("transform","translate(" + 0 + "," + margin.top + ")"); 
   
   
   //Draw the polylines
   //Create polyline function
   var line = d3.line()
      .defined(function (d,i) {return (!isNaN(d[1])) }) //remove undefined points (this causes breaks in lines, need to find better soln.)
      .x(function(d,i) { return range_Points[i%n]; } )
      .y(function (d,i) { return yScales[i%n]( d[1] ) })
   
   //Plot polylines with SVG
   var group_select;
   var color;
   var alpha;
   for (var i = 0; i < plot_data.length; i++){
      //Determine if the polyline should be displayed as its group color, or grayed out
      group_select = plot_data[i].belongsTo(show.group);
      color = "#000000";
      alpha = .035;
      for (var j = 0; j < group_select.length; j++){
         if (show.lines.get(group_select[j])){
            color = colorScale(group_select[j]);
            alpha = .5;
            break;
         }
      }
      
      vis.append("path")
         .datum(plot_data[i].getPairs(show.data))
         .attr("transform","translate(" + margin.left + "," + margin.top +")")
         .attr("fill", "none")
         .attr("id","p_line" + i)
         .attr("stroke", color)
         .attr("stroke-linejoin", "round")
         .attr("stroke-linecap", "round")
         .attr("stroke-width",1.5)
         .attr("stroke-opacity",alpha)
         .attr("d",line);
   }
   
   //add the y-axes, brushes, and labels
   for (var j = 0; j < n; j++){
      var x = (margin.left + (j/(n-1)) * width)
      var axis = vis.append("g")
         .attr("transform","translate(" + x + "," + (margin.top) + ")")
         .call(yAxes[j]);
      axis.append("g")
         .attr("class","brush")
         .attr("id","brush" + j)
         .call(brushes[j])
      vis.append("text")
         .attr("transform","translate(" + (margin.left/2 + (j/(n-1)) * width) + "," + (height + 2*margin.bottom/3) + ")")
         .attr("font-size","15px")
         .text(show.data[j]);
   }
   
   return yScales;
}

function updateColors(plot_data,data,sets,tags,brushed){
   var show = getActives(data,sets,tags);
   var vis = d3.select("#svg");
   var colorScale = d3.scaleOrdinal().domain(show.subsets).range(d3.schemeCategory10);
   //update legend
   for (var i = 0; i < show.subsets.length; i++){
      dataSel = $("#color" + i);
      dataSel.css({"fill":colorScale(show.subsets[i]), "stroke":"black", "stroke-width":"3", "opacity":"0.7"});
   }
   for (var i = 0; i < plot_data.length; i++){
      //Determine if the polyline should be displayed as its group color, or grayed out
      group_select = plot_data[i].belongsTo(show.group);
      color = "#000000";
      alpha = .035;
      for (var j = 0; j < group_select.length; j++){
         if (show.lines.get(group_select[j]) && brushed[i]){
            color = colorScale(group_select[j]);
            alpha = .5;
            break;
         }
      }
      
      vis.select("#p_line" + i)
         .attr("stroke",color)
         .attr("stroke-opacity",alpha);
   }
   
}

//given array of strings, strips leading and trailing quotation marks
function clean(arr){
   var result = Array.from(arr);
   for (var i = 0; i < arr.length; i++){
      while (result[i].startsWith("\"")){
         result[i] = result[i].slice(1);
      }
      while (result[i].endsWith("\"")){
         result[i] = result[i].slice(0,-1);
      }
   }
   return result;
}

function updateLegend(legend_tags){
   $("#LegendSelectors").append($("<p>" +
      "<input class=\"w3-check w3-left\" type=\"checkbox\" id = \"selectAll\" checked=\"checked\"" + "\">" +
      "<label class=\"w3-validate\" for = \"selectAll\">" + "Select All" + "</label>" +
      "</p>"));            
   for (var i = 0; i < legend_tags.length; i++){
      $("#LegendSelectors").append("<p>" +
      "<input class=\"w3-check w3-left\" type=\"checkbox\" id = \"cbox_L" + (i) + "\"" + "checked=\"checked\"" + "\">" +
      "<label class=\"w3-validate\" for = \"cbox_L" + (i) + "\">" + legend_tags[i] + "</label>" +
      "<svg class = \"w3-right\" width=\"30\" height=\"30\">" +
      "<rect x=\"3\" y=\"3\" rx=\"5\" ry=\"5\" width=\"24\" height=\"24\" " +
         "id = \"color" + (i) + "\"/>" +
      "</svg>"+
      "</p>");            
   }
}

function getActives(data,sets,tags){
   result = {axis:[], data:[], subsets:[], group:"", lines:new Map()}
   var dataSel;
   for (var i = 0; i < data.length; i++){
      dataSel = $("#cbox" + i);
      if (dataSel.prop("checked") == true){
         result.axis.push(true);
         result.data.push(data[i]);
      } else {
         result.axis.push(false);
      }
   }

   for (var i = 0; i < sets.length; i++){
      dataSel = $("#rad" + i);
      if (dataSel.prop("checked") == true){
         result.group = sets[i];
         break;
      }
   }
   
   result.subsets = Array.from(tags.get(result.group));
   
   for (var i = 0; i < result.subsets.length; i++){
      dataSel = $("#cbox_L" + i);
      if (dataSel.prop("checked") == true){
         result.lines.set(result.subsets[i],true);
      } else {
         result.lines.set(result.subsets[i],false);
      }
   }
   
   return result;
}

function getBrushed(plot_data,yScales,actives){
   var extent;
   var brushed=[];
   var data_point;
   for (var j = 0; j < plot_data.length; j++){
      brushed.push(true);
   }
   for (var j = 0; j < yScales.length; j++){
      extent = d3.brushSelection(d3.select("#brush" + j).node());
      if (extent){
         for (var k = 0; k < plot_data.length; k++){
            data_point = plot_data[k].getPairs(actives.data)[j][1];
            if( yScales[j](data_point) <= extent[0]   || yScales[j](data_point) >= extent[1] || isNaN(data_point) ){
               brushed[k] = false;
            }
         }
      }
   }
   return brushed;
}

   
   
   