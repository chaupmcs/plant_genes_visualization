async function read_data_for_venn() {

    let set_data = {};
    // await DataFrames.fromCSV("data_ALL_norm.csv").then(data => {
    //     set_data["0"] = {};
    //     set_data["0"]["data"] = data.select("atID").toArray().flat();
    //     set_data["0"]["name"] = "Total data";
    // });

    set_data["0"] = {};
    set_data["0"]["data"] = _cur_df.select("atID").toArray().flat();
    set_data["0"]["name"] = "Data";

    await DataFrame.fromCSV("data/STOP1_targets_EckerLab.csv").then(data => {
        set_data["1"] = {};
        set_data["1"]["data"] = data.select("atID").toArray().flat().filter(x => x!="");
        set_data["1"]["name"] = "Ecker";
    });

    await DataFrame.fromCSV("data/Transcription_factors.csv").then(data => {
        set_data["2"] = {};
        set_data["2"]["data"] = data.select("TF_DE").toArray().flat().filter(x => x!="");
        set_data["2"]["name"] = "TDE";

        set_data["3"] = {};
        set_data["3"]["data"] = data.select("TF_EXP").toArray().flat().filter(x => x!="");
        set_data["3"]["name"] = "EXP";
    });

    await DataFrame.fromCSV("data/Targets_differentially_expressed.csv").then(data => {
        set_data["4"] = {};
        set_data["4"]["data"] = data.select("up").toArray().flat().filter(x => x!="");
        set_data["4"]["name"] = "Up";

        set_data["5"] = {};
        set_data["5"]["data"] = data.select("down").toArray().flat().filter(x => x!="");
        set_data["5"]["name"] = "Down";

        set_data["6"] = {}
        set_data["6"]["data"] = data.select("up_and_down").toArray().flat().filter(x => x!="");;
        set_data["6"]["name"] = "UpDown";
    });

    return set_data;

}
function update_data_for_venn() {
    if (typeof _set_data_venn != 'undefined')
    {
        _set_data_venn["0"]["data"] = _cur_df.distinct("atID").toArray().flat();

    }
};


function calc_overlapping_number_for_venn(sub_set_id, set_data) {
    let res = {};
    if (sub_set_id.length == 1) {
        res["size"] =  set_data[sub_set_id[0]]["data"].length;
        res["data_list"] = set_data[sub_set_id[0]]["data"];
        return res;
    } else {
        let intersection = set_data[sub_set_id[0]]["data"];
        for (let i = 1; i < sub_set_id.length; i++) {
            intersection = intersection.filter(x => set_data[sub_set_id[i]]["data"].includes(x)); // todo can improve (if alread calc 1,2 => 1,2,3
        }

        res["size"] =  intersection.length;
        res["data_list"] =intersection;
        return res;

    }

}function create_sets_obj_for_venn(){
    let sets_venn = [];
    let all_set_ids =  get_all_subsets_id(Object.keys(_set_data_venn).length);
    all_set_ids.forEach(sub_set_id => {
        let tmp = {};
        tmp["sets"] = sub_set_id;
        if (sub_set_id.length == 1) {
            tmp["label"] = _set_data_venn[sub_set_id[0]]["name"];
            tmp["size"] =  _set_data_venn[sub_set_id[0]]["data"].length;
            tmp["data_list"] = _set_data_venn[sub_set_id[0]]["data"];
        }
        ;
        let size_and_data_list = calc_overlapping_number_for_venn(sub_set_id, _set_data_venn);
        tmp["size"] = size_and_data_list["size"];
        tmp["data_list"] = size_and_data_list["data_list"];
        sets_venn.push(tmp);
    })
    return sets_venn;
}

function draw_venn(sets_venn) {

    _cur_venn_div.datum(sets_venn).call(_cur_venn_chart);

    var tooltip = d3.select("body").append("div")
        .attr("class", "venntooltip");

    _cur_venn_div.selectAll("path")
        .style("stroke-opacity", 0)
        .style("stroke", "#fff")
        .style("stroke-width", 3)

    _cur_venn_div.selectAll("g")
        .on("mouseover", function (d, i) {
            // sort all the areas relative to the current item
            venn.sortAreas(_cur_venn_div, d);

            // Display a tooltip with the current size
            tooltip.transition().duration(400).style("opacity", .9);
            tooltip.text(d.size + " genes");

            // highlight the current path
            var selection = d3.select(this).transition("tooltip").duration(400);
            selection.select("path")
                .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
                .style("stroke-opacity", 1);
        })

        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })

        .on("mouseout", function (d, i) {
            tooltip.transition().duration(400).style("opacity", 0);
            var selection = d3.select(this).transition("tooltip").duration(400);
            selection.select("path")
                .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
                .style("stroke-opacity", 0);
        })
        .on("click", (d) => {
            console.log(d);

            if (d.size ==  _cur_df.count()){
                console.log("return, nothing change!")
                return;

            }
            let data = _total_df.filter( row => d.data_list.includes(row.get("atID")) );
            _cur_df = data;

            reset_DisplayIndex_and_DisplayDF();
            updateDataForSVGCharts();
            print_paging_sms_for_chart();
            updateCharts();

            updateTAbleWithColor();


        });



}



