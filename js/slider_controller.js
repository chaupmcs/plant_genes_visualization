function master_slider_oninput(){
    let master_val = _cur_master_slider.value;
    _cur_master_slider_value.innerHTML = master_val / 100;
    change_color_slider_bar(_cur_master_slider, master_val, MY_COLORS.gray, MY_COLORS.slider_master);

    change_all_slider_values_to_the_master(master_val, _cur_condition_cols);
    auto_filter();
    calc_and_show_stats_table();
}


function change_all_slider_values_to_the_master(master_val, cols) {
    let col_slider_value, col_slider, col_btn;

    if (!_pairwise) {

        cols.forEach((col) => {
            col_slider_value = document.getElementById(col + "_slider_value");
            col_slider = document.getElementById(col + "_slider");
            col_btn = document.getElementById(col + "_btn");

            col_slider_value.innerHTML = master_val / 100;
            $("#" + col + "_slider").val(master_val);
            change_color_ctrl_slider_bar_auto_choose_color(col_btn, col_slider, master_val);
        })
    } else {
        cols.forEach((col) => {
            col_slider_value = document.getElementById(col.replace(mutant_class, pairwise_class + "_") + "_slider_value");
            col_slider = document.getElementById(col.replace(mutant_class, pairwise_class + "_") + "_slider");
            col_btn = document.getElementById(col.replace(mutant_class, pairwise_class + "_") + "_btn");

            col_slider_value.innerHTML = master_val / 100;
            $("#" + col.replace(mutant_class, pairwise_class + "_") + "_slider").val(master_val);
            change_color_ctrl_slider_bar_auto_choose_color(col_btn, col_slider, master_val);
        })
    }
}

function update_text_when_sliders_change(sld, pairwise) {
    let slider, slider_value, col_btn;
    if (!pairwise) {
        slider = document.getElementById(sld + "_slider");
        slider_value = document.getElementById(sld + "_slider_value");
        col_btn = document.getElementById(sld + "_btn");

    } else {
        slider = document.getElementById(sld.replace(mutant_class, pairwise_class + "_") + "_slider");
        slider_value = document.getElementById(sld.replace(mutant_class, pairwise_class + "_") + "_slider_value");
        col_btn = document.getElementById(sld.replace(mutant_class, pairwise_class + "_") + "_btn");
    }


    slider_value.innerHTML = slider.value;
    slider.oninput = function () {
        slider_value.innerHTML = this.value / 100;
        auto_filter();
        change_color_ctrl_slider_bar_auto_choose_color(col_btn, slider, slider.value);
    }
}

wt_condition_cols.forEach(wt => update_text_when_sliders_change(wt, false));
s1_condition_cols.forEach(s1 => update_text_when_sliders_change(s1, false));
pairwise_condition_cols.forEach(pairwise_col => update_text_when_sliders_change(pairwise_col, true));


wt_master_slider.oninput = master_slider_oninput;
s1_master_slider.oninput = master_slider_oninput;
pairwise_master_slider.oninput = master_slider_oninput;


