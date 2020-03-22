

function openTab(evt, scenarioName) {


    _cur_df = _total_df;

    reset_DisplayIndex_and_DisplayDF();
    print_paging_sms_for_chart();
    // reset_sort_smses();


    cur_active_tab = scenarioName;
    set_global_varibles_by_CurActiveTab();


    let i, tabcontent, tablinks, btns_list = [];
    updateDataForSVGCharts();

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(scenarioName).style.display = "block";

    if (scenarioName == tab_names["base_class"]) {
        wt_master_slider.value = 0;
        wt_master_slider_value.innerText = "0";
        change_color_slider_bar(wt_master_slider, 0, MY_COLORS.gray, MY_COLORS.slider_master);

        wt_ctrl_btn();
        change_all_slider_values_to_the_master(0, wt_condition_cols);

        // $('.statsTable_and_print').show();



    } else if (scenarioName == tab_names["mutant_class"]) {

        s1_master_slider.value = 0;
        s1_master_slider_value.innerText = "0";
        change_color_slider_bar(s1_master_slider, 0, MY_COLORS.gray, MY_COLORS.slider_master);


        s1_ctrl_btn();
        change_all_slider_values_to_the_master(0, s1_condition_cols);

        // $('.statsTable_and_print').show();

    } else if (scenarioName ==  tab_names["pairwise_class"]) {

        pairwise_master_slider.value = 0;
        pairwise_master_slider_value.innerText = "0";
        change_color_slider_bar(pairwise_master_slider, 0, MY_COLORS.gray, MY_COLORS.slider_master);


        change_all_slider_values_to_the_master(0, s1_cols);


        pairwise_ctrl_btn();
        // $('.statsTable_and_print').show();


    } else if (scenarioName ==  tab_names["custom"]) {

        custom_ctrl_btn();
        // $('.statsTable_and_print').hide();


    }

    btns1 = d3.selectAll('.wt_filter_btn')[0];
    btns2 = d3.selectAll('.s1_filter_btn')[0];
    btns3= d3.selectAll('.pairwise_filter_btn')[0];
    btns_list.push(btns1);
    btns_list.push(btns2);
    btns_list.push(btns3);

    btns_list.forEach(reset_color);

    evt.currentTarget.className += " active";

};