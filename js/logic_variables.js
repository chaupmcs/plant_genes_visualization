const MY_COLORS = {
    "green": "rgb(145, 207, 96)",
    "orange": "rgb(252, 141, 89)",
    "gray": "rgb(232, 232, 232)",
    "default": "rgb(231, 231, 231)",
    "gradient": "linear-gradient(to right, rgb(145, 207, 96), rgb(252, 141, 89)",
    "slider_default": '#c75f04',
    "slider_master": "mediumvioletred",
    "blue": "lightblue",
}

const ENCODE_COLOR = {
    1: MY_COLORS.green,
    2: MY_COLORS.orange,
    3: MY_COLORS.gray,
}

const cell_colors = {
    "greater": MY_COLORS.green,
    "less": MY_COLORS.orange,
    "no_color": MY_COLORS.gray,
    "gradient": MY_COLORS.gradient,
    "blue": MY_COLORS.blue

}

const tab_names = {
    "base_class": "wt_comparison",
    "mutant_class": "s1_comparison",
    "pairwise_class": 'pairwise_comparison',
    "custom": "custom_mode"
};

// todo: replace this
const names = {
    "atID": "month",
    "index": "year",
    "value": "unemployment",
    "gene": "state"
};

const DataFrame = dfjs.DataFrame;

// Todo: read the column names from the input file.
const wt_cols = ['wthp6', 'wtlp6', 'wthp5', 'wtlp5', 'wtal', 'wtfe'];
const s1_cols = ['s1hp6', 's1lp6', 's1hp5', 's1lp5', 's1al', 's1fe'];
const all_cols = ['wthp6', 'wtlp6', 'wthp5', 'wtlp5', 'wtal', 'wtfe', 's1hp6', 's1lp6', 's1hp5', 's1lp5', 's1al', 's1fe'];

const wt_base = wt_cols[0];
const s1_base = s1_cols[0];
const wt_condition_cols = wt_cols.slice(1);
const s1_condition_cols = s1_cols.slice(1);
const pairwise_condition_cols = s1_cols;

let _cur_base, _cur_condition_cols, _cur_class;
let _cur_master_slider, _cur_master_slider_value;
let _pairwise = false;


let svgCharts;
let _cur_index;
let display_index;
let display_df;
let color_arr = [MY_COLORS.default, MY_COLORS.green, MY_COLORS.orange, MY_COLORS.gray];
let _total_df;
let _cur_df;

let cur_active_tab = tab_names["base_class"];
let MAXIMUM_DISPLAY = 500;
const base_class = "wt";
const mutant_class = "s1";
const pairwise_class = "pairwise";


let _set_data_venn;