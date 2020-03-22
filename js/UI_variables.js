function create_master_slider(cur_class) {
    let master_slider_div_id, master_input_class, master_slider_id, master_slider_value, master_slider_div_class,
        parent_element;
    master_slider_div_class = "master_slider_div";
    master_slider_div_id = cur_class + "_master_slider_div";
    master_input_class = cur_class + "_master_slider";
    master_slider_id = cur_class + "_master_slider";
    master_slider_value = cur_class + "_master_slider_value";
    parent_element = "#" + cur_class + "_comparison";

    let slider_master = d3.select(parent_element)
        .select("." + master_slider_div_class)
        .attr("id", master_slider_div_id);


    slider_master.append("p")
        .text("Master slider: ")
        .append("span")
        .attr("id", master_slider_value)
        .text("0");
    slider_master.append("br")

    slider_master.append("input")
        .attr("id", master_slider_id)
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", 0)
        .classed("slider", true)
        .classed("master_slider", true)
        .classed(master_input_class, true)

}


function create_statTable_obj(cur_class) {
    parent_element = "#" + cur_class + "_comparison";

    let table = d3.select(parent_element).select(".statsTable_and_masterSlider");

    table.append('div')
        .attr("class", "statsTableClass")
        .attr("id", cur_class + "_statsTableDiv")
        .append("table")
        .attr("id", cur_class + "_statsTable");
}

create_master_slider(base_class);
create_master_slider(mutant_class);
create_master_slider(pairwise_class);

create_statTable_obj(base_class);
create_statTable_obj(mutant_class);
create_statTable_obj(pairwise_class);


const wt_master_slider = document.getElementById("wt_master_slider");
const wt_master_slider_value = document.getElementById("wt_master_slider_value");

const s1_master_slider = document.getElementById("s1_master_slider");
const s1_master_slider_value = document.getElementById("s1_master_slider_value");

const pairwise_master_slider = document.getElementById("pairwise_master_slider");
const pairwise_master_slider_value = document.getElementById("pairwise_master_slider_value");

let my_stats_table;

let dataTable = document.getElementById('ipdatacsvTbl');
let wt_statsTable = document.getElementById('wt_statsTable');
let s1_statsTable = document.getElementById('s1_statsTable');
let pairwise_statsTable = document.getElementById('pairwise_statsTable');

let _cur_statsTable = wt_statsTable;
let comparison_radio = $(document.getElementsByName("comparison"));

let margin = {top: 15, right: 0, bottom: 20, left: 25};
let w = $("#unemploymentCharts").width() * 0.99 - margin.left - margin.right;
let h = 200 - margin.bottom - margin.top;
let svgHeight = h + margin.top + margin.bottom;
let svgWidth = w + margin.left + margin.right;

let xScale = d3.scale.linear().range([0, w]);
let yScale = d3.scale.linear().domain([0, 1]).range([h, 0]);

// todo: auto update num ticks when having a few datum.
let xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(6).tickFormat((_, i) => {
    console.log("==============here inside xAxis");
    return display_df.select("atID").toArray().flat()[i];
});

let yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

let venn_div_wt = d3.select("#venn_wt");

let venn_w = 210;
let venn_h = 210;
let venn_chart_wt = venn.VennDiagram()
    .width(venn_w)
    .height(venn_h);

let venn_div_s1 = d3.select("#venn_s1");
let venn_chart_s1 = venn.VennDiagram()
    .width(venn_w)
    .height(venn_h);

let venn_div_pairwise = d3.select("#venn_pairwise");
let venn_chart_pairwise = venn.VennDiagram()
    .width(venn_w)
    .height(venn_h);


let _cur_venn_chart, _cur_venn_div;