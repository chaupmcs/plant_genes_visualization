function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

zip = rows => rows[0].map((_, c) => rows.map(row => row[c])) //zip([[1,2,3], [11,12,13]])


function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}

function reset_color(button_list) {
    button_list.forEach(button => {
            d3.select(button).style("background-color", color_arr[0]);
            d3.select(button).style("background-image", MY_COLORS.gradient);

        }
    )

}

function get_responding_wt_from_s1(wt_name) {
    return wt_name.replace("s1", "wt");
}

function change_color_slider_bar(btn, val, left_color, right_color, gradient = false) {
    if (gradient) {
        $(btn).css('background-image', `linear-gradient(to right, ${MY_COLORS.gray} ${val}%, ${MY_COLORS.green} ${val}%, ${MY_COLORS.orange} 100%)`)
    } else {
        $(btn).css('background-image', `linear-gradient(90deg, ${left_color} ${val}%, ${right_color} 0%)`);
    }
}

function change_color_ctrl_slider_bar_auto_choose_color(col_btn, col_slider, val) {

    let cur_color = d3.select(col_btn).style("background-color").toString();
    let background_image = d3.select(col_btn).style("background-image");
    let gradient = false;
    let left_color, right_color;
    if (cur_color == MY_COLORS.green) {
        left_color = MY_COLORS.gray;
        right_color = MY_COLORS.green;
    } else if (cur_color == MY_COLORS.orange) {
        left_color = MY_COLORS.gray;
        right_color = MY_COLORS.orange;
    } else if (background_image != "none") {
        gradient = true;
    } else {
        left_color = MY_COLORS.slider_default;
        right_color = MY_COLORS.gray;
    }

    change_color_slider_bar(col_slider, val, left_color = left_color, right_color = right_color, gradient);
}

function selectAllCheckboxes() {
    let checkboxes = document.getElementsByName("stateSelection");
    let _this = document.getElementById("all");

    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked != _this.checked) {
            changeChartDisplay(checkboxes[i].id);
        }
    }
}

function permutator(n) {
    var result = [];
    for (let y_ = 0; y_ < Math.pow(2, n); y_++) {
        var combo = [];
        for (let x_ = 0; x_ < n; x_++) {
            //shift bit and and it with 1
            if ((y_ >> x_) & 1)
                combo.push(true);
            else
                combo.push(false);
        }
        result.push(combo);
    }
    return result;
}


function permutator_base_3(res, results, n) {
    if (res.length == n) {
        results.push(res);
    } else {
        permutator_base_3([...res, 1], results, n);
        permutator_base_3([...res, 2], results, n);
        permutator_base_3([...res, 3], results, n);
    }
}


function create_filter_btn_and_slider(col, test_class, base_col, pairwise, mutant_class, base_class) {
    let btn_id, btn_text, slider_id, slider_value_id, parent_element, btn_filter_class, slider_class;
    if (pairwise) {
        base_col = col.replace(mutant_class, base_class);
        btn_text = col + " vs. " + base_col;

        col = col.replace(mutant_class, "pairwise_"); // after getting btn_text, change col
    } else {
        btn_text = col + " vs. " + base_col;

    }
    btn_id = col + "_btn";
    slider_id = col + "_slider";
    slider_value_id = col + "_slider_value";
    btn_filter_class = test_class + "_filter_btn";
    slider_class = test_class + "_slider";

    parent_element = "#" + test_class + "_comparison";

    let btn_and_slider = d3.select(parent_element)
        .select('.btn-group')
        .append('div')
        .attr("class", "btn_and_slide_container"); // or .classed("btn_and_slide_container", true)

    btn_and_slider.append("button")
        .attr("id", btn_id)
        .classed(btn_filter_class, true)
        .classed("filter_btn", true)
        .text(btn_text);

    btn_and_slider.append("input")
        .attr("id", slider_id)
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", 0)
        .classed("slider", true)
        .classed(slider_class, true)

    btn_and_slider.append("p")
        .append("span")
        .attr("id", slider_value_id)
        .text("0");

}


function* subsets(array, offset = 0) {
    while (offset < array.length) {
        let first = array[offset++];
        for (let subset of subsets(array, offset)) {
            subset.push(first);
            yield subset;
        }
    }
    yield [];
}


function get_all_subsets_id(n) {
    let arr = Array.from(Array(n).keys());
    all_set_ids = []
    for (let subset of subsets(arr)) {
        if (subset.length > 0) {
            all_set_ids.push(subset);

        }
    }
    return all_set_ids;

}


