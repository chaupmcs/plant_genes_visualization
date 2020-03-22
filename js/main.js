// draw filter btns
wt_condition_cols.forEach(wt => {
    create_filter_btn_and_slider(wt, base_class, wt_base, false);
});


s1_condition_cols.forEach(s1 => {
    create_filter_btn_and_slider(s1, mutant_class, s1_base, false);
});
pairwise_condition_cols.forEach(p => {
    create_filter_btn_and_slider(p, pairwise_class, "", true, mutant_class, base_class);
});



// Define the line.
var valueLine = d3.svg.line()
    .x(function (d) {
        return xScale(d.year);
    })
    .y(function (d) {
        return yScale(d.unemployment);
    });

var zeroLine = d3.svg.line()
    .x(function (d) {
        // console.log('yyy',x(d.year));
        return xScale(d.year);
    })
    .y(yScale(0));

// Define the area.
var valueArea = d3.svg.area()
    .x(function (d) {
        return xScale(d.year);
    })
    .y1(function (d) {
        return yScale(d.unemployment);
    });

var zeroArea = d3.svg.area()
    .x(function (d) {
        return xScale(d.year);
    })
    .y0(yScale(0))
    .y1(yScale(0));

var bisect = d3.bisector(function (d) {
    return d.year;
}).left;

function change_btn_color_when_click(_this, color) {
    let nex_index;
    let cur_color = d3.select(_this).style("background-color").toString();
    let cur_index = color_arr.indexOf(cur_color);
    if (typeof color == 'undefined') {
        nex_index = cur_index < color_arr.length - 1 ? cur_index + 1 : 0;
        color = color_arr[nex_index];
    } else {
        $(_this).css('background-color', color);
    }

    $(_this).css('background-color', color);

    if (color == MY_COLORS.default) {
        d3.select(_this).style("background-image", MY_COLORS.gradient);
    } else {
        d3.select(_this).style("background-image", "none");
    }

}

function auto_filter() {

    $("#stateComparisonListdown").val(_cur_base);
    let button_list = d3.selectAll(`.${_cur_class}_filter_btn`)[0];
    filter(button_list, _pairwise, `.${_cur_class}_slider`).then(df => {
        updateTableAndVenn(dataTable, df.toCollection());
    });
}


function filter_btn_click_func() {
    let _this = this;
    change_btn_color_when_click(_this);
    auto_filter();

    let slider = document.getElementById(_this.id.replace("btn", "slider"));
    change_color_ctrl_slider_bar_auto_choose_color(_this, slider, slider.value);

}

$('.wt_filter_btn').click(filter_btn_click_func);
$('.s1_filter_btn').click(filter_btn_click_func);
$('.pairwise_filter_btn').click(filter_btn_click_func);
comparison_radio.on("click", function () {
    let _this = this;

    if (_this.value == "state") {
        $("#stateComparisonListdown").attr("disabled", false);
    } else {
        $("#stateComparisonListdown").attr("disabled", true);
    }
});

$("#all").on("click", selectAllCheckboxes);

$("#option_form").on("change", () => {
    updateCharts();
});

DataFrame.fromCSV("data/data_ALL_norm.csv").then(data => {

    data  = data.sortBy(wt_base);
    set_global_varibles_by_CurActiveTab();
    console.log("here, DataFrame.fromCSV");

    _total_df = data;
    _cur_df = _total_df;

    if (_total_df.count() > MAXIMUM_DISPLAY) {
        display_index = MAXIMUM_DISPLAY;
    } else {
        display_index = _total_df.count();
    }

    _cur_index = display_index;
    document.getElementById("next_page_sms").innerText = `Show the first ${display_index}, out of ${_cur_df.count()} genes`;

    display_df = _total_df.slice(0, display_index);



    read_data_for_venn().then(set_data_venn =>{
        _set_data_venn = set_data_venn;
        let sets_venn = create_sets_obj_for_venn();
        draw_venn(sets_venn);
    })


    let my_all_data = {};
    all_cols.forEach((gene_name) => {
        let df = display_df.select('atID', gene_name);
        df = df.rename("atID", names["atID"]).rename(gene_name, names["value"]);
        df = df.withColumn(names['index'], (row, i) => i + 1)
            .withColumn(names['gene'], () => gene_name);
        my_all_data[gene_name] = df.toCollection();

    });


    let stateChartData = [];
    for (let state in my_all_data) {
        let d = {};
        d.state = state;
        d.series = my_all_data;
        stateChartData.push(d);
    }

    var stateOptions = d3.select("#stateOptions");
    var stateComparisons = d3.select("#stateComparisonListdown");


    let tick_ = new Date;
    console.log(".... Inside CHART + READ CSV");
    stateChartData.forEach(function (d) {
        var option = stateOptions
            .append("label")
            .datum(d.state);
        option.append("input")
            .attr("type", "checkbox")
            .property("checked", function (d) {
                return (d == "wthp6")
            })
            .attr("name", "stateSelection")
            .attr("id", removeWhitespace)
            .on("click", changeChartDisplay);
        option.append("text")
            .text(d.state);
        option.append("br");

        var comparison = stateComparisons.append("option")
            .datum(d.state)
            .attr("value", d.state)
            .text(d.state);

    });

    // re-Scale the range of the data
    xScale.domain([1, display_index]);
    // y.domain([0, d3.max(data, function(d) { return d.unemployment; })]);

    // Create the svgs for the charts.
    svgCharts = d3.select("#unemploymentCharts").selectAll("svg")
        .data(stateChartData, d => d.state)
        .enter()
        .append("svg")
        .style("display", "block")
        .attr("id", function (d) {
            return removeWhitespace(d.state);
        })
        .classed("chartActive", function (d) {
            return d.state == "wthp6";
        })
        .attr("width", svgWidth)
        .attr("height", function (d) {
            if (d.state == "wthp6") {
                return svgHeight;
            } else {
                return 0;
            }
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var defs = svgCharts.append("defs");
    // console.log("defs is ", defs);

    // Add background.
    svgCharts.append("rect")
        .attr("transform", "translate(0,-" + margin.top + ")")
        .attr("width", w)
        .attr("height", h + margin.top + margin.bottom)
        .attr("fill", "white");

    // Side clip-path.
    defs.append("clipPath")
        .attr("id", "sideClip")
        .append("rect")
        .attr("transform", "translate(0,-" + margin.top + ")")
        .attr("width", w)
        .attr("height", h + margin.top);

    // Add the baseline.
    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "baseline")
        .attr("d", (d) => {
            return zeroLine(d.series[d.state]);
        });

    // Add the areas.
    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "area below")
        .attr("fill", "steelblue")
        .attr("d", function (d) {
            return zeroArea(d.series[d.state]);
        });

    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "area above")
        .attr("d",
            d => {
                // console.log(d);
                zeroArea(d.series[d.state]);
            }
        );

// Area gets drawn in updateCharts()
// Draw the axes.
    svgCharts.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")


// text label for the x axis
    svgCharts.append("text")
        .attr("transform",
            "translate(" + (w) + " ," +
            (h) + ")")
        .style("text-anchor", "end")
        .text("Gene Name");


    svgCharts.append("g")
        .attr("class", "y axis");

// Add y-axis label.
    svgCharts.append("text")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Expressed (norm)");


// Add focus circle and value.
    var focus = svgCharts.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
        .attr("x", 9)
        .attr("y", -5)
        .attr("dy", ".35em");

    // todo: change name of the chart
    svgCharts.append("text")
        .datum(function (d) {
            return d.state;
        })
        .attr("x", w)
        .attr("y", 0)
        .attr("text-anchor", "end")
        .style("font", "15px Arial")
        .attr("fill", "#888")
        .text(function (d) {
            return d;
        });

    console.log(`..... END of read+svg ${(new Date - tick_) / 100}s`);


// Register mouse handlers.
    d3.select("#unemploymentCharts").selectAll("svg")
        .on("mouseover", function (d) {
            // console.log("mouseOver");
            var focus = d3.select(this).select(".focus");
            focus.style("display", null);
        })
        .on("mouseout", function (d) {
            var focus = d3.select(this).select(".focus");
            focus.style("display", "none");
        })
        .on("mousemove", mousemove)
        .on("dblclick", function (d) {
            changeChartDisplay(d.state);
        });

    function mousemove(d) {

        // console.log("mousemove");
        // console.log(d);

        // todo: Fix i
        var x0 = xScale.invert(d3.mouse(this)[0]);
        var i = bisect(d.series[d.state], x0, 1);
        var d0 = d.series[d.state][i - 1];
        var d1 = d.series[d.state][i];

        if ((typeof d1 == 'undefined') || (typeof d0 == 'undefined')) {
            return;
        }


        var d_new = x0 - d0.year > d1.year - x0 ? d1 : d0;
        var lineElement = d3.select(this).select(".baseline").node();
        var BBox = lineElement.getBBox();
        var pathLength = lineElement.getTotalLength();
        var scale = pathLength / BBox.width;
        var mouse = d3.mouse(this);
        var beginning = 0, end = lineElement.getTotalLength(), target = null;
        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = lineElement.getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
            }
            if (pos.x > mouse[0]) end = target;
            else if (pos.x < mouse[0]) beginning = target;
            else break; //position found
        }

        var focus = d3.select(this).select(".focus");
        if (x0 > w / 2) {
            focus.select("text").attr("x", -0);
            focus.select("text").attr("text-anchor", "end");
        } else {
            focus.select("text").attr("x", 0);
            focus.select("text").attr("text-anchor", "start");
        }
        focus.attr("transform", "translate(" + pos.x + "," + pos.y + ")");
        focus.select("text").text((d_new.month + ": " + d_new.unemployment));


        let rows = document.querySelectorAll("#ipdatacsvTbl tr");// ## $( "#ipdatacsvTbl tr" )[0].scrollIntoView();
        let cur_row = Array.from(rows).find((d, i) => {
            return d.firstChild.textContent == d_new.month;
        });

        Array.from(rows).forEach((d, i) => {
            d.style.fontWeight = "normal";
            d.style.backgroundColor = i % 2 == 0 ? '#ececec' : '#ffffff'
        });
        cur_row.style.backgroundColor = '#BCD4EC';
        cur_row.style.fontWeight = "bold";

        cur_row.scrollIntoView({
            behavior: 'instant',
            block: 'center'
        });

    }

    wt_ctrl_btn();
});

d3.select("#stateComparisonListdown").on("change", () => {
    updateCharts();

});

function wt_ctrl_btn() {
    calc_and_show_stats_table();

    // Tick all wt_cols, except the first one\
    let checkboxes = document.getElementsByName("stateSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            // console.log("Skip");
        } else {
            if (wt_cols.slice(1).includes(checkboxes[i].id)) {
                if (!checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            } else {
                if (checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            }
        }

    }
    updateTableAndVenn(dataTable, display_df.toCollection());

    // mark comparison
    comparison_radio.prop("checked", true).trigger("click");
    $("#stateComparisonListdown").attr("disabled", false);
    $("#stateComparisonListdown").val("wthp6");
    updateCharts()

}

function s1_ctrl_btn() {

    calc_and_show_stats_table();

    // Tick all s1_cols, except the first one\
    let checkboxes = document.getElementsByName("stateSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
        } else {
            if (s1_cols.slice(1).includes(checkboxes[i].id)) {
                if (!checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            } else {
                if (checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            }
        }

    }

    updateTableAndVenn(dataTable, display_df.toCollection());

    // mark comparison
    comparison_radio.prop("checked", true).trigger("click");
    $("#stateComparisonListdown").attr("disabled", false);
    $("#stateComparisonListdown").val("s1hp6");
    updateCharts();
}

function pairwise_ctrl_btn() {
    calc_and_show_stats_table();

    // Tick all wt_cols, except the first one
    let checkboxes = document.getElementsByName("stateSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            // console.log("Skip");
        } else {
            if (s1_cols.includes(checkboxes[i].id)) {
                if (!checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            } else {
                if (checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            }
        }
    }

    updateTableAndVenn(dataTable, display_df.toCollection());

    // mark comparison for s1
    comparison_radio.prop("checked", true);
    $("#stateComparisonListdown").attr("disabled", true);
    updateCharts(); //todo check here
}

function custom_ctrl_btn() {

    // untick all, except the first one\
    let checkboxes = document.getElementsByName("stateSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            // console.log("Skip");
        } else if (checkboxes[i].id == "wthp6") {
            if (!checkboxes[i].checked) {
                changeChartDisplay(checkboxes[i].id);
            }
        } else {
            if (checkboxes[i].checked) {
                changeChartDisplay(checkboxes[i].id);
            }
        }
    }

    updateDataForSVGCharts();
    updateTable(dataTable, display_df.toCollection());

    $("#stateComparisonListdown").attr("disabled", false);
    $("#stateComparisonListdown").val("wthp6");
    $('#noComparison').prop('checked', true)
    comparison_radio.trigger("change");
}

function changeChartDisplay(d) {
    var id = d.replace(/\s+/g, '');
    var stateChart = d3.select("#unemploymentCharts")
        .select("#" + id);


    var stateCheckBox = d3.select("#stateOptions").select("#" + id);
    var active = stateChart.classed("chartActive");

    if (!active) {
        // console.log("changeChartDisplay: inactive -> active");
        stateCheckBox.property("checked", true);
        stateChart
            .attr("height", svgHeight)
            .attr("opacity", 1);

    } else {
        // console.log("changeChartDisplay:  active -> inactive");

        stateCheckBox.property("checked", false);
        stateChart
            .attr("height", 0)
            .attr("opacity", 0);
    }
    stateChart.classed("chartActive", !active);
}

function updateChartNoComparison() {
    this.select(".area.below")
        .attr("fill", "steelblue")
        .attr("d", function (d) {
            return valueArea.y0(yScale(0))(d.series[d.state]);
        });

    this.select(".area.above")
        .attr("d", function (d) {
            return zeroArea.y0(yScale(0))(d.series[d.state]);
        });

    this.select(".baseline")
        .attr("d", function (d) {
            return valueLine(d.series[d.state]);
        });

    this.select(".x.axis")
        .call(xAxis);

    this.select(".y.axis")
        .call(yAxis);
}

function updateChartStateComparison(d, pairwise) {
    let comparedState;
    //Todo: need a better way to get the data
    if (pairwise) {
        comparedState = get_responding_wt_from_s1(d["0"]["0"].__data__.state)//document.getElementById("stateComparisonListdown").value;
    } else {
        comparedState = document.getElementById("stateComparisonListdown").value;
    }

    // Update areas.
    this.select(".area.below")
        .attr("fill", MY_COLORS.green)
        .attr("d", function (d) {
            var y0 = function (a, i) {
                return yScale(d3.min([d.series[comparedState][i].unemployment, d.series[d.state][i].unemployment]));
            };
            return valueArea.y0(y0)(d.series[d.state]);
        });
    this.select(".area.above")
        .attr("d", function (d) {
            var y0 = function (a, i) {
                return yScale(d3.max([d.series[comparedState][i].unemployment, d.series[d.state][i].unemployment]));
                //return y(d.series[comparedState][i].unemployment);
            };
            return valueArea.y0(y0)(d.series[d.state]);
        });

    this.select(".baseline")
        .attr("d", function (d) {
            return valueLine(d.series[d.state]);
        });


    this.select(".x.axis")
        .call(xAxis);

    this.select(".y.axis")
        .call(yAxis);
}

function updateCharts(pairwise = _pairwise) {

    xScale.domain([1, display_index]);

    // Update the charts.
    var activeCharts = d3.select("#unemploymentCharts").selectAll(".chartActive");
    var allCharts = d3.select("#unemploymentCharts").selectAll("svg");

    // console.log("activeCharts", activeCharts);
    var inactiveCharts = allCharts.filter(function (obj) {
        return !activeCharts[0].some(function (obj2) {
            return removeWhitespace(obj.state) == obj2.id;
        });
    });

    if (document.getElementById("noComparison").checked) {
        // No comparison selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .call(updateChartNoComparison)
                    .transition().duration(1)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d3.select(d).call(updateChartNoComparison);
                        });
                    });

            } else {
                d3.select(d)
                    .call(updateChartNoComparison);
            }
        });
    } else if (document.getElementById("stateComparison").checked) {
        // State comparisons selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .call(updateChartStateComparison, pairwise)
                    .transition().duration(1)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d = d3.select(d);
                            d.call(updateChartStateComparison, pairwise);
                        });
                    });

            } else {
                d3.select(d)
                    .call(updateChartStateComparison, pairwise);
            }
        });
    }

}

function updateDataForSVGCharts() {
    let my_all_data = {};

    all_cols.forEach((gene_name) => {
        let tmp_df = display_df.select('atID', gene_name);
        tmp_df = tmp_df.rename("atID", names["atID"]).rename(gene_name, names["value"]);
        tmp_df = tmp_df.withColumn(names['index'], (row, i) => i + 1)
            .withColumn(names['gene'], () => gene_name);
        my_all_data[gene_name] = tmp_df.toCollection();
    })


    let stateChartData = [];
    for (let state in my_all_data) {
        let d = {};
        d.state = state;
        d.series = my_all_data;
        stateChartData.push(d);
    }
    d3.select("#unemploymentCharts").selectAll("svg").data(stateChartData, d => d.state);
}


function reset_DisplayIndex_and_DisplayDF(df = _cur_df) {
    // check the number of rows currently
    if (df.count() < MAXIMUM_DISPLAY) {
        display_index = df.count()
    } else {
        display_index = MAXIMUM_DISPLAY;
    }

    _cur_index = display_index;
    display_df = _cur_df.slice(0, display_index);
}

async function filter(button_list, pairwise = false, slider_class) {
    // reset_sort_smses();
    let filteredDf = filter_data(button_list, pairwise, _total_df, slider_class);
    _cur_df = filteredDf;

    reset_DisplayIndex_and_DisplayDF();
    updateDataForSVGCharts();

    print_paging_sms_for_chart();

    updateCharts();

    return display_df;
};


function filter_data(button_list, pairwise, df, slider_class) {
    let slider_ctrl_list = d3.selectAll(slider_class)[0];

    let filteredDf = df;
    let cur_base_condition;
    if (!pairwise) {
        cur_base_condition = document.getElementById("stateComparisonListdown").value;
        for (let i = 0, n = button_list.length; i < n; i++) {
            let bt = d3.select(button_list[i]);
            let col = bt.text().split(" ")[0];
            let slider = slider_ctrl_list.find((slider => slider.id.split("_")[0] == col));


            if (bt.style("background-color").toString() == color_arr[0]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) >= parseInt(slider.value) / 100);
            } else if (bt.style("background-color").toString() == color_arr[1]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) < (row.get(col) - parseInt(slider.value) / 100));

            } else if (bt.style("background-color").toString() == color_arr[2]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) - parseInt(slider.value) / 100 > row.get(col));
            } else if (bt.style("background-color").toString() == color_arr[3]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) <= parseInt(slider.value) / 100);
            }
        }
    } else {
        for (let i = 0, n = button_list.length; i < n; i++) {

            let bt = d3.select(button_list[i]);
            let col = bt.text().split(" ")[0];
            cur_base_condition = get_responding_wt_from_s1(col);
            let slider = slider_ctrl_list.find((slider => slider.id.split("_")[1] == col.replace("s1", "")));


            if (bt.style("background-color").toString() == color_arr[0]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) >= parseInt(slider.value) / 100);
            } else if (bt.style("background-color").toString() == color_arr[1]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) < (row.get(col) - parseInt(slider.value) / 100));

            } else if (bt.style("background-color").toString() == color_arr[2]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) - parseInt(slider.value) / 100 > row.get(col));
            } else if (bt.style("background-color").toString() == color_arr[3]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) <= parseInt(slider.value) / 100);
            }
        }
    }
    return filteredDf;
}


$(document.getElementById("next_page")).on("click", () => {
        let pairwise = false;

        if (_cur_df.count() > _cur_index) {
            if (_cur_index + MAXIMUM_DISPLAY > _cur_df.count()) {
                display_df = _cur_df.slice(_cur_index, _cur_df.count());
                console.log(display_df.dim());

                display_index = _cur_df.count() - _cur_index;
                _cur_index = _cur_df.count();
            } else {
                display_df = _cur_df.slice(_cur_index, _cur_index + MAXIMUM_DISPLAY);
                _cur_index += MAXIMUM_DISPLAY;
                display_index = MAXIMUM_DISPLAY;
            }
        } else {
            console.log("return");
            return;
        }

        updateDataForSVGCharts();
        updateCharts();
        updateTableAndVenn()
        print_paging_sms_for_chart();


    });

$(document.getElementById("previous_page")).on("click", () => {
        let pairwise = false;
        if (_cur_index <= MAXIMUM_DISPLAY) {
            console.log("return");
            return;
        }

        if (_cur_index % MAXIMUM_DISPLAY == 0) {
            display_df = _cur_df.slice(_cur_index - MAXIMUM_DISPLAY, _cur_index);

            _cur_index = _cur_index - MAXIMUM_DISPLAY;
            display_index = MAXIMUM_DISPLAY;
        } else {
            display_df = _cur_df.slice(_cur_index - _cur_index % MAXIMUM_DISPLAY - MAXIMUM_DISPLAY, _cur_index - _cur_index % MAXIMUM_DISPLAY);

            console.log("cur_index - cur_index % MAXIMUM_DISPLAY - MAXIMUM_DISPLAY", _cur_index - _cur_index % MAXIMUM_DISPLAY - MAXIMUM_DISPLAY);
            console.log("cur_index - cur_index % MAXIMUM_DISPLAY", _cur_index - _cur_index % MAXIMUM_DISPLAY);
            display_index = MAXIMUM_DISPLAY;
            _cur_index = _cur_index - _cur_index % MAXIMUM_DISPLAY;
            console.log("-=-=-= cur_index", _cur_index);
        }

        updateDataForSVGCharts();
        updateCharts();

        // todo: fix pairwise (have a func to auto pick mode) + class for color
        updateTableAndVenn();

        print_paging_sms_for_chart();
    });

function print_paging_sms_for_chart() {
    document.getElementById("next_page_sms").innerText = `Show ${display_index}, page ${Math.ceil(_cur_index / MAXIMUM_DISPLAY)}/${Math.ceil(_cur_df.count() / MAXIMUM_DISPLAY)}, out of ${_cur_df.count()} genes`;
}

function set_global_varibles_by_CurActiveTab() {
    console.log("cur_active_tab ====", cur_active_tab);
    if (cur_active_tab == tab_names["base_class"]) {
        _pairwise = false;
        _cur_base = wt_base;
        _cur_condition_cols = wt_condition_cols;
        _cur_class = base_class;

        _cur_master_slider = wt_master_slider;
        _cur_master_slider_value = wt_master_slider_value;

        _cur_venn_chart = venn_chart_wt;
        _cur_venn_div = venn_div_wt;

        _cur_statsTable = wt_statsTable;

    } else if (cur_active_tab == tab_names["mutant_class"]) {
        _pairwise = false;
        _cur_base = s1_base;
        _cur_condition_cols = s1_condition_cols;
        _cur_class = mutant_class;

        _cur_master_slider = s1_master_slider;
        _cur_master_slider_value = s1_master_slider_value;

        _cur_venn_chart = venn_chart_s1;
        _cur_venn_div = venn_div_s1;

        _cur_statsTable = s1_statsTable;

    } else if (cur_active_tab == tab_names["pairwise_class"]) {
        _pairwise = true;
        _cur_base = "NO";
        _cur_condition_cols = pairwise_condition_cols;
        _cur_class = pairwise_class;

        _cur_master_slider = pairwise_master_slider;
        _cur_master_slider_value = pairwise_master_slider_value;

        _cur_venn_chart = venn_chart_pairwise;
        _cur_venn_div = venn_div_pairwise;

        _cur_statsTable = pairwise_statsTable;
    }
}




