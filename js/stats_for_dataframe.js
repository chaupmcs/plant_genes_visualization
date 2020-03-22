function row_to_cluster(row, base_col, thres, all_cluster) {
    let cluster = [];

    for (let i = 0; i < _cur_condition_cols.length; i++) {
        if (_pairwise) {
            base_col = _cur_condition_cols[i].replace(mutant_class, base_class);
        }

        if (parseFloat(row.get(_cur_condition_cols[i])) - parseFloat(row.get(base_col)) > parseFloat(thres)) {
            cluster.push(1);
        } else if (parseFloat(row.get(base_col)) - parseFloat(row.get(_cur_condition_cols[i])) > parseFloat(thres)) {
            cluster.push(2);
        } else if (Math.abs(parseFloat(row.get(base_col)) - parseFloat(row.get(_cur_condition_cols[i]))) <= parseFloat(thres)) {
            cluster.push(3);
        }
    }
    all_cluster[cluster] += 1;

}

function calc_stat_for_1_combination(df, base_col, master_slider, all_cluster) {
    let thres = master_slider.value / 100;
    df.map((row) => row_to_cluster(row, base_col, thres, all_cluster));

    return all_cluster;
}


function calc_all_stats(df, base_col, master_slider) {
    let compare_conditions_list = [];
    let all_cluster = {};
    permutator_base_3([], compare_conditions_list, _cur_condition_cols.length);

    compare_conditions_list.forEach(cluster => all_cluster[cluster] = 0);

    let stats_results = [];
    all_cluster = calc_stat_for_1_combination(df, base_col, master_slider, all_cluster);
    stats_results = Object.entries(all_cluster).map(x => [...x[0].split(","), x[1]]);

    return stats_results;
}

function create_stats_table(tbl, rows) {
    // $(statsTable).empty();

    tbl.innerHTML = '';
    if (rows && rows.length > 0) {
        let headers = Object.keys(rows[0]);

        let header = tbl.createTHead();
        let body = tbl.createTBody();
        let hRow = header.insertRow();
        headers.forEach(hd => {
            let hCell = hRow.insertCell();
            hCell.innerText = hd;
        });

        rows.forEach(rowDt => {
            let row = body.insertRow();
            headers.forEach(hd => {
                let cell = row.insertCell();
                let text = rowDt[hd];

                if (hd != "#genes") {
                    if (text == 1) { //up
                        cell.style.background = MY_COLORS.green;
                        cell.innerHTML = text;
                        cell.style.color = cell.style.background;
                    } else if (text == 2) { // down
                        cell.style.background = MY_COLORS.orange;
                        cell.innerHTML = text;
                        cell.style.color = cell.style.background;
                    } else if (text == 3) { // does NOT change
                        cell.style.background = MY_COLORS.gray;
                        cell.innerHTML = text;
                        cell.style.color = cell.style.background;
                    }
                } else { //last column => show #genes
                    cell.innerHTML = text;
                }
            });
        });
    }
}


function click_row_callback(row_data) {
    let master_val, button_list, color_list;

    master_val = parseInt(_cur_master_slider.value);
    _cur_master_slider_value.innerHTML = master_val / 100;
    change_all_slider_values_to_the_master(master_val, _cur_condition_cols);
    button_list = document.getElementsByClassName(_cur_class +"_filter_btn");

    color_list = row_data.map(x => ENCODE_COLOR[x]);

    // Change color of buttons, do NOT trigger the event button click
    button_list.forEach((btn, i) => change_btn_color_when_click(btn, color_list[i]));

    // call update all btns function => filter all the btn at once
    change_all_slider_values_to_the_master(master_val, _cur_condition_cols);
    auto_filter();
}

function calc_and_show_stats_table() {
    let master_slider, base, stats_col_names, df;

    base = _cur_base;
    stats_col_names = _cur_condition_cols;
    master_slider = _cur_master_slider;

    if (_pairwise){
        stats_col_names = stats_col_names.map(x => x.replace(mutant_class, ""));
    }

    console.log("Calculating the summary table...");
    let tick = new Date;
    let stats_results = calc_all_stats(_total_df, base, master_slider);
    console.log(`Done the computation, running time = ${(new Date - tick) / 1000}s`);


    let new_header = [...stats_col_names, "#genes"];
    df = new DataFrame(stats_results, new_header);


    //todo



    create_stats_table(_cur_statsTable, df.toCollection());

    $(document).ready(function () {
            my_stats_table = $(_cur_statsTable).DataTable({
                // Todo: show the sorting arrows
                order: [[df.dim()[1] - 1, 'des']],

                destroy: true,
                // scrollY:        '200px',
                // scrollCollapse: true,
                paging: false,
                searching: false,
                bInfo: false,

            });
            $(`#${_cur_class + "_statsTable"} tbody`).on('click', 'tr', function () {
                let row_data = my_stats_table.row(this).data();
                click_row_callback(row_data.slice(0, row_data.length - 1));
            });
        }
    )


}



