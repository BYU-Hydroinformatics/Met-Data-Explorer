
var VARIABLES_PACKAGE = (function(){

  $(function(){
    $("#btn-add-addVariables").on("click",addVariablesToTD);
    $("#btn-del-variables").on("click",deleteVariablesToTD);
    $("#update_graphs").on("click",getFullArray);
    $("#spatial_input").on("change", function(){
      let method_draw = $(this).val();
      chosen_method_spatial(method_draw)
    })
    $("#show_wms").change(myWMS_display);
    $("#variables_graph").on("change", function(){
      let actual_state=$("#show_wms").prop('checked');
      if(actual_state){
        myWMS_display2()
      }
      let tdds_e3;
      Object.keys(id_dictionary).forEach(function(key) {
        if(id_dictionary[key] == `${current_tdds}_join_${current_Group}` ){
          tdds_e3 = key;
        }
      });
      let layernameUI = `${$("#variables_graph").val()}_${tdds_e3}`;
      let dimensions = layers_dict_wms[layernameUI]['dimensions'];
      let dim_orders_id = $("#dim_select");
      dim_orders_id.empty();
      dimensions.forEach(function(dim){
        let option;
        option = `<option value=${dim} >${dim} </option>`;
        dim_orders_id.append(option);
        dim_orders_id.selectpicker("refresh");
      })
      dim_orders_id.selectpicker('selectAll');

      // extra dim //

      let extra_dim_order = $("#extra_dim");
      console.log(layers_dict_wms[layernameUI]['dimensions']);
      if(layers_dict_wms[layernameUI]['dimensions'].length > 3){
        console.log("entro 4");
        extra_dim_order.empty();
        extra_dim_order.selectpicker("refresh");
        extra_dim_order.selectpicker('hide');
        let extra_json =layers_dict_wms[layernameUI]['extra_dim'];
        layers_dict_wms[layernameUI]['dimensions'].forEach(function(dim){
          if(dim != "lat" && dim !="lon"){
            if(!dim.includes("time")){
              console.log("las tiene");
              let option;
              option = `<option value=${dim}> Select a ${dim} val </option>`;
              extra_dim_order.append(option);
              console.log(extra_json[dim]);
              extra_json[dim].forEach(function(val_e){
                // console.log(val_e);
                let option2 = `<option value=${val_e}> ${val_e} </option>`;
                extra_dim_order.append(option2);
              })
              extra_dim_order.selectpicker("refresh");
              extra_dim_order.selectpicker('show');
            }
          }
        })
      }
      else{
        extra_dim_order.empty();
        extra_dim_order.selectpicker("refresh");
        extra_dim_order.selectpicker('hide');
      }


    })
    $("#variable_met_info").on("click", function(){
      let tdds_e3;
      Object.keys(id_dictionary).forEach(function(key) {
        if(id_dictionary[key] == `${current_tdds}_join_${current_Group}` ){
          tdds_e3 = key;
        }
      });
      let id_vari = `${$("#variables_graph").val()}_${tdds_e3}_info`;

      // $(`#${id_vari}`).on("click", function(){
        $("#metadata_vars").empty();
        let info_content = get_metadata_button(attr[i]);
        $(info_content).appendTo("#metadata_vars");
    });

    $("#btn-geo_link").on("click", function(){
      input_spatial = $("#geoServer_link").val();
      $.ajax({
          type: "GET",
          url: input_spatial,
          dataType: "json",
          success: function(result) {
            let geoJsonObject = result

            let check = {};
            geoJsonObject['features'].forEach(function(fed){
              Object.keys(fed['properties']).forEach(function(single_k){
                if(!check.hasOwnProperty(single_k)){
                  check[single_k] = [];
                  check[single_k].push(single_k);
                }
                else{
                  check[single_k].push(single_k);
                }

              })
            })
            let attr_shp = [];
            Object.keys(check).forEach(function(ch_key){
              if(check[ch_key].length == geoJsonObject['features'].length){
                attr_shp.push(ch_key)
              }
            })
            console.log(geoJsonObject['features']);
            console.log(attr_shp);
            if(attr_shp.length == 0){
              $.notify(
                  {
                      message: `Please, upload a different shapefile that contains at least a common property in all the features of the shapefile.`
                  },
                  {
                      type: "info",
                      allow_dismiss: true,
                      z_index: 20000,
                      delay: 5000,
                      animate: {
                        enter: 'animated fadeInRight',
                        exit: 'animated fadeOutRight'
                      },
                      onShow: function() {
                          this.css({'width':'auto','height':'auto'});
                      }
                  }
              )
            }

            // let attr_shp = Object.keys(geoJsonObject['features'][0]['properties']);
            let feature_select = $("#features_file");
            feature_select.empty();
            feature_select.selectpicker('refresh');
            attr_shp.forEach(function(attr){
              let option;
              option = `<option value=${attr} >${attr} </option>`;
              feature_select.append(option)
              feature_select.selectpicker("refresh");
            });
            var myStyle = {
                "color": "#E2E5DE",
                "weight": 5,
                "opacity": 0.5
            };

            jsonLayer = L.geoJSON(result, {
                style: myStyle
            })
            jsonLayer.addTo(mapObj);
            mapObj.flyToBounds(jsonLayer.getBounds());
          }
      })

    })
    $("#download_dropdown").on("change", function(){
      let method_download = $(this).val();
      download_Methods(method_download);
    })
    $("#get_data_values").on("click", get_data_bounds);
    $("#apply_config").on("click",apply_style_config);
    $("#btn-add-shp").on("click", uploadShapefile)

    // $(document).on("click", "add_var", function(){
    //   console.log("no");
    //   $("GeneralLoading").removeClass("hidden")
    // })

  })

})()

var apply_style_config = function(){
  if(!$('#show_wms').is(":checked")){
    $('#show_wms').bootstrapToggle('on');
  }
  var range = $("#wmslayer-bounds").val();
  var opacity = $("#wmslayer-style").val();
  var colorStyle = $("#wmslayer-style").val();
  myWMS_display2();

}

var get_data_bounds = function(){
  let variable_active = $("#variables_graph").val();
  let json_request = {
    variable: variable_active,
    group: current_Group,
    tdds: current_tdds
  }
  $('#GeneralLoading').removeClass('hidden');

  $.ajax({
      type: "POST",
      url: `get-data-bounds/`,
      data: json_request,
      dataType: "json",
      success: function(result) {
        $("#wmslayer-bounds").val(result['range']);
        $('#GeneralLoading').addClass('hidden');
        $.notify(
            {
                message: `Bounds were succesfully retrieved`
            },
            {
                type: "success",
                allow_dismiss: true,
                z_index: 20000,
                delay: 5000,
                animate: {
                  enter: 'animated fadeInRight',
                  exit: 'animated fadeOutRight'
                },
                onShow: function() {
                    this.css({'width':'auto','height':'auto'});
                }
            }
        )
      },
      error:function(e){
        $('#GeneralLoading').addClass('hidden');
        console.log(e);
        $.notify(
            {
                message: `There was an error retrieving the data bounds`
            },
            {
                type: "danger",
                allow_dismiss: true,
                z_index: 20000,
                delay: 5000,
                animate: {
                  enter: 'animated fadeInRight',
                  exit: 'animated fadeOutRight'
                },
                onShow: function() {
                    this.css({'width':'auto','height':'auto'});
                }
            }
        )
      }
    })
}


var download_Methods = function(method_download){
  if(method_download == 'CSV'){
    var csvData = [];
    // var csvData_temp = [];

    var header = [] //main header.
    Object.keys(values_donwload_json).forEach(function(key) {
        header.push(key);
    });
    csvData.push(header);


    for (let i = 0; i < Object.keys(values_donwload_json['datetime']).length; i++) {
      let row = []
      for (let r = 0; r < header.length; r++) {
          row.push(values_donwload_json[header[r]][i]);
      }
      csvData.push(row);

    }

    var csvFile = csvData.map(e=>e.map(a=>'"'+((a||"").toString().replace(/"/gi,'""'))+'"').join(",")).join("\r\n"); //quote all fields, escape quotes by doubling them.
    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${$("#variables_graph").val()}` + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    $.notify(
        {
            message: `Download completed for the ${$("#variables_graph").val()} variable in CSV format`
        },
        {
            type: "sucess",
            allow_dismiss: true,
            z_index: 20000,
            delay: 5000,
            animate: {
              enter: 'animated fadeInRight',
              exit: 'animated fadeOutRight'
            },
            onShow: function() {
                this.css({'width':'auto','height':'auto'});
            }
        }
    )



  }
  if(method_download == 'JSON'){

    var dataStr = JSON.stringify(values_donwload_json,null,2);

    var blob = new Blob([dataStr], { type: 'text/json;charset=utf-8;' });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", $("#variables_graph").val() + ".json");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    $.notify(
        {
            message: `Download completed for the ${$("#variables_graph").val()} variable in JSON format`
        },
        {
            type: "sucess",
            allow_dismiss: true,
            z_index: 20000,
            delay: 5000,
            animate: {
              enter: 'animated fadeInRight',
              exit: 'animated fadeOutRight'
            },
            onShow: function() {
                this.css({'width':'auto','height':'auto'});
            }
        }
    )

  }
  if(method_download == 'xml'){
    // console.log("xml");
    // console.log(values_donwload_json);
    // var dataStr = parser.parse(values_donwload_json);
    // console.log(dataStr);
    // var blob = new Blob([dataStr], { type: 'application/octet-stream;' });
    // var link = document.createElement("a");
    // var url = URL.createObjectURL(blob);
    // link.setAttribute("href", url);
    // link.setAttribute("download", $("#variables_graph").val() + ".json");
    // link.style.visibility = 'hidden';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    $.notify(
        {
            message: `We are still working in these feature :)`
            // message: `Download completed for the ${$("#variables_graph").val()} variable in XML format`
        },
        {
            type: "sucess",
            allow_dismiss: true,
            z_index: 20000,
            delay: 5000,
            animate: {
              enter: 'animated fadeInRight',
              exit: 'animated fadeOutRight'
            },
            onShow: function() {
                this.css({'width':'auto','height':'auto'});
            }
        }
    )
  }
}

var myWMS_display = function(){
  let tdds_e3;

  Object.keys(id_dictionary).forEach(function(key) {
    if(id_dictionary[key] == `${current_tdds}_join_${current_Group}` ){
      tdds_e3 = key;
    }
  });
  let layernameUI = `${$("#variables_graph").val()}_${tdds_e3}`;
  // console.log(layers_dict_wms[layernameUI]);
  // console.log(layernameUI);
  // console.log(layers_dict_wms);
  layers_dict_wms[layernameUI]['style'] = $('#wmslayer-style').val();
  layers_dict_wms[layernameUI]['range'] = $('#wmslayer-bounds').val();
  updateWMSLayer(layernameUI,layers_dict_wms[layernameUI]);

}
var myWMS_display2 = function(){
  let tdds_e3;

  Object.keys(id_dictionary).forEach(function(key) {
    if(id_dictionary[key] == `${current_tdds}_join_${current_Group}` ){
      tdds_e3 = key;
    }
  });
  let layernameUI = `${$("#variables_graph").val()}_${tdds_e3}`;
  layers_dict_wms[layernameUI]['style'] = $('#wmslayer-style').val();
  layers_dict_wms[layernameUI]['range'] = $('#wmslayer-bounds').val();
  updateWMSLayer2(layernameUI,layers_dict_wms[layernameUI]);
}
var chosen_method_spatial = function(method_draw){
  if(method_draw == 'draw_map'){
    $(".leaflet-draw-section").show();
    try{
      mapObj.removeLayer(jsonLayer);
    }
    catch(e){
      console.log("no cat");
    }
    let option_beginning= `<option value="select_val"> Select Feature Property Name</option>`;
    let feature_select = $("#features_file");
    feature_select.empty();
    feature_select.append(option_beginning);
    feature_select.selectpicker('refresh');
    $("#fifthContainer").addClass("hidden");
  }
  if(method_draw == 'upload_shp'){
    $(".leaflet-draw-section").hide();
    $('#externalSPTL_modal').modal("show");
    type_of_series = 'shape';
    drawnItems.clearLayers();
    try{
      mapObj.removeLayer(jsonLayer);
    }
    catch(e){
      console.log("no cat");
    }
    $("#fifthContainer").removeClass("hidden");

  }
  if(method_draw == 'geoserv_link'){
    type_of_series = 'geoserver';
    $(".leaflet-draw-section").hide();
    $('#Geo_link_modal').modal("show");
    drawnItems.clearLayers();
    try{
      mapObj.removeLayer(jsonLayer);
    }
    catch(e){
      console.log("no cat");
    }
    $("#fifthContainer").removeClass("hidden");
  }


}

var drawGraphTwo = function() {
    let timeseriesVariable = false;
    let timeseriesFeature = false;
    $('.timeseries-variable').each(function () {
        if ($(this).attr('data-selected') == 'true') {
            timeseriesVariable = $(this).attr('data-variable');
        }
    })
    $('.timeseries-features').each(function () {
        if ($(this).attr('data-selected') == 'true') {
            timeseriesFeature = $(this).attr('data-feature');
        }
    })
    let series = {};
    series['timeseries'] = fullArrayTimeseries[timeseriesVariable]['datetime'];
    series['mean'] = fullArrayTimeseries[timeseriesVariable][timeseriesFeature];
    let x = [];
    let y = [];
    for (let i = 0; i < Object.keys(series['timeseries']).length; i++) {
        x.push(series['timeseries'][i]);
        y.push(series['mean'][i]);
    }
    let variable = $('#variable-input').val();
    let layout = {
        title: 'Mean of ' + variable,
        xaxis: {title: 'Time', type: 'datetime'},
        yaxis: {title: 'Amount'}
    };
    let values = {
        x: x,
        y: y,
        mode: 'lines+markers',
        type: 'scatter'
    };
    Plotly.newPlot('chart-two', [values], layout);
    let chart = $("#chart-two");
    Plotly.Plots.resize(chart[0]);
}

var deleteVariablesToTD = function(){
  let $modalAddVars = $("#modalDeleteVariable");
  var datastring = $modalAddVars.serialize();
  datastring += `&actual-group=${current_Group}`
  datastring += `&actual-tdds=${current_tdds}`
  $.ajax({
      type: "POST",
      url: `delete-vars/`,
      data: datastring,
      dataType: "HTML",
      success: function(result) {
        let variables_to_del = JSON.parse(result)['var_list'];
        let new_title;
        Object.keys(id_dictionary).forEach(function(key) {
          if(id_dictionary[key] == `${current_tdds}_join_${current_Group}` ){
            new_title = key;
          }
        });
        variables_to_del.forEach(function(single_var){
          $(`#${single_var}deleteID`).remove();
          let layernameUI = `${single_var}_${new_title}`
          removeActiveLayer(layernameUI);
          let row_var_table = `${single_var}_${new_title}_info`;
          $(`#${row_var_table}`).parent().parent().remove();

          var select_dropdown = $(`#variables_graph option[value="${single_var}"]`).remove();
          $("#variables_graph").selectpicker("refresh");
          $('#show_wms').bootstrapToggle('on');

          delete layers_dict_wms[layernameUI];
          let index_remove = current_vars.indexOf(single_var);
          if (index_remove > -1) {
            current_vars.splice(index_remove, 1);
          }

        });

      },
      error:function(e){
        console.log(e);
      }
    })
}

var addVariablesToTD = function(){
  let units = 'false';
  let color = 'false';
  let attr = {};
  $('.attr-checkbox').each(function () {
      if (this.checked) {
          let var_string = $(this).val().split('_a_')[0];
          let allDimensions = [];
          var x = document.getElementById(`${var_string}_time`);
          if(x != null){
            allDimensions = $(`#${var_string}_time`).val();
            // var i;
            // for (i = 0; i < x.length; i++) {
            //     allDimensions.push(x.options[i].text);
            // }
            attr[var_string] = {
                name: var_string,
                dimensions: allDimensions,
                units: units,
                color: color,
            }
          }
          else{
            let time = '';
            let location = '';
            if ($(`#${var_string}_time`).val() == '') {
                time = false;
            } else {
                time = $(`#${var_string}_time`).val();
            }
            if ($(`#${var_string}_location`).val() == '') {
                location = [false, false];
            } else {
                lat = $(`#${var_string}_location`).val();
            }
            attr[var_string] = {
                name: var_string,
                dimensions: `${time},${location[0]},${location[1]}`,
                units: units,
                color: color,
            }
          }
          current_vars.push(var_string)
      }
  })
  if(Object.keys(attr).length <= 0){
    $.notify(
        {
          message: "Please select at least one variable."
        },
        {
            type: "info",
            allow_dismiss: true,
            z_index: 20000,
            delay: 5000,
            animate: {
              enter: 'animated fadeInRight',
              exit: 'animated fadeOutRight'
            },
            onShow: function() {
                this.css({'width':'auto','height':'auto'});
            }
        }
    )
    return false
  }
  let json_request = {
    attributes: JSON.stringify(attr),
    current_tdds: current_tdds,
    current_group:current_Group
  }
  $.ajax({
      type: "POST",
      url: `add-vars/`,
      data: json_request,
      dataType: "json",
      success: function(result) {
        try{
          console.log(result);
          // let attr2 = JSON.parse(result['all_attr']);
          let attr2 = result['all_attr'];
          let current_tdds_id;
          let layers_style = {}

          Object.keys(id_dictionary).forEach(function(key) {
              if(id_dictionary[key].split('_join_')[0] == current_tdds){
                current_tdds_id = key;
              }
          })


          if( current_tdds_id == tdds_displaying_metadata){
            console.log("here now");
            let table_content = $('#table_var_body').html().split('</tbody>')[0];
            Object.keys(attr).forEach(function(single_att_key) {

            // for (let i = 0; i< attr.length; ++i){
              table_content += "<tr>";
              // let var_metad = attr[i];
              let var_metad = attr[single_att_key];
              // MAKE THE HEADERS FIRST //
              Object.keys(var_metad).forEach(function(key) {
                if(key =="name"){
                  let fixed_name = var_metad[key].replace(/_/g, ' ')
                  table_content += `<td >${fixed_name}</td>`;
                  table_content += `<td>
                            <button id = "${var_metad[key]}_${current_tdds_id}_info" class="btn btn-primary" data-toggle="modal" data-dismiss="modal" data-target="#modalMetaDataInfo">
                                <i class="fas fa-info-circle"></i>
                            </button>
                  </td>`;
                }

                if(key != "metadata_var" && key != "color" && key != "name" && key != "units"){

                  table_content += `<td>${var_metad[key]}</td>`;
                }

              });


              table_content += "</tr>";

            })
            table_content += "</tbody>"
            $("#table_var_body").empty();
            // let table_content = get_table_vars(attr2,current_tdds_id);

            $(table_content).appendTo("#table_var_body");
            // let info_file = make_metadata_file_table(result['metadata_file'],result);
            // $(info_file).appendTo("#siteDes");
          }
          // for (let i = 0; i< attr.length; ++i){
          Object.keys(attr2).forEach(function(single_att_key) {

            $(`#${attr2[single_att_key]['name']}_${current_tdds_id}_info`).on("click", function(){
              $("#metadata_vars").empty();
              let info_content = get_metadata_button(attr2[single_att_key]);
              $(info_content).appendTo("#metadata_vars");
            })

            // DEFINE THE LAYER ATTRIBUTES //

            let layernameUI = `${attr2[single_att_key]['name']}_${current_tdds_id}`
            layers_style[layernameUI] = {}
            layers_style[layernameUI]['title'] = attr2[single_att_key]['name'];
            layers_style[layernameUI]['opacity']= $("#opacity-slider").val();
            layers_style[layernameUI]['wmsURL']= wmsURL;
            layers_style[layernameUI]['style'] = $('#wmslayer-style').val();
            layers_style[layernameUI]['range'] = $('#wmslayer-bounds').val();
            layers_style[layernameUI]['variable'] = attr2[single_att_key]['name'];
            layers_style[layernameUI]['subset'] = subsetURL;
            layers_style[layernameUI]['opendap'] = url;
            layers_style[layernameUI]['spatial'] = {};
            layers_style[layernameUI]['epsg'] = attr2[single_att_key]['epsg'];
            layers_style[layernameUI]['selected'] = false;
            layers_style[layernameUI]['dimensions'] = attr2[single_att_key]['dimensions'];
            layers_style[layernameUI]['extra_dim'] = JSON.parse(result['extra_coordinate']);


            layers_dict_wms = layers_style;

            // ADD A EVENT LISTENER FOR THE OPCACITY IN THE LAYERS SETTINGS //
            $("#opacity-slider").on("change", function(){
              changeOpacity(layernameUI,this.value);
              layers_style[layernameUI]['opacity']= $("#opacity-slider").val();
            })


          });

          options_vars(attr2, current_tdds_id);

          //ADD event listener to display the modality after each click in the info logo///
          let input_check_serv = $(`#${current_tdds_id}_span`);


          input_check_serv.on("click", function(){
            $('#sG').bootstrapToggle('on');

            current_tdds = id_dictionary[current_tdds_id].split('_join_')[0];
            current_Group = current_Group;

            subsetURL = $(this).attr("data-subset-url");
            $("#GeneralLoading").removeClass("hidden");
            $(`#${current_tdds_id}`).css({"border-color":"#2e6da4", "border-width": "2px 2px" });
            console.log(current_tdds_id);
            Object.keys(id_dictionary).forEach(function(key) {
              if(key != current_tdds_id ){
                $(`#${id_dictionary[key]}`).css({"border-color":"darkgrey", "border-width": "0px 0px"});

              }
            })
            // console.log(last_selected_id);
            tdds_displaying_metadata = current_tdds_id;


            //CLEAN TABLE //
            $("#table_div").empty();
            $("#siteDes").empty();

           //MAKE DROPDOWN MENU FOR VARIABLES//
           options_vars(attr2, current_tdds_id);
           ///MAKE TABLE//
           let table_content = get_table_vars(attr2,current_tdds_id);

           let info_file = make_metadata_file_table(result['metadata_file'], result);
           $(info_file).appendTo("#siteDes");

           $(table_content).appendTo("#table_div");
           //make the layers to display

           let layernameUI2 = `${attr2[0]['name']}_${current_tdds_id}`
           layers_style[layernameUI2] = {}
           layers_style[layernameUI2]['title'] = attr2[0]['name'];
           layers_style[layernameUI2]['opacity']= $("#opacity-slider").val();
           layers_style[layernameUI2]['wmsURL']= wmsURL;
           layers_style[layernameUI2]['style'] = $('#wmslayer-style').val();
           layers_style[layernameUI2]['range'] = $('#wmslayer-bounds').val();
           layers_style[layernameUI2]['variable'] = attr2[0]['name'];
           layers_style[layernameUI2]['subset'] = subsetURL;
           layers_style[layernameUI2]['opendap'] = url;
           layers_style[layernameUI2]['spatial'] = {};
           layers_style[layernameUI2]['epsg'] = attr2[0]['epsg'];
           layers_style[layernameUI2]['selected'] = false;
           layers_style[layernameUI2]['dimensions'] = attr2[0]['dimensions'];
           layers_style[layernameUI2]['extra_dim'] = JSON.parse(result['extra_coordinate']);

           layers_dict_wms = layers_style;

           // make the dims dropdown for the first varriable //
           let dim_orders_id = $("#dim_select");
           dim_orders_id.empty();

           layers_style[layernameUI2]['dimensions'].forEach(function(dim){
             let option;
             option = `<option value=${dim} >${dim} </option>`;
             dim_orders_id.append(option);
             dim_orders_id.selectpicker("refresh");
           })
           dim_orders_id.selectpicker('selectAll');

           // extra dim //
           let extra_dim_order = $("#extra_dim");

           console.log(layers_style[layernameUI2]['dimensions']);
           if(layers_style[layernameUI2]['dimensions'].length > 3){
             console.log("entro 4");
             extra_dim_order.empty();
             extra_dim_order.selectpicker('refresh');
             extra_dim_order.selectpicker('hide');
             let extra_json =layers_style[layernameUI2]['extra_dim'];
             layers_style[layernameUI2]['dimensions'].forEach(function(dim){
               if(dim != "lat" && dim !="lon"){
                 if(!dim.includes("time")){
                   console.log("las tiene");
                   let option;
                   option = `<option value=${dim}> Select a ${dim} val </option>`;
                   extra_dim_order.append(option);
                   console.log(extra_json[dim]);
                   extra_json[dim].forEach(function(val_e){
                     // console.log(val_e);
                     let option2 = `<option value=${val_e}> ${val_e} </option>`;
                     extra_dim_order.append(option2);
                   })
                   extra_dim_order.selectpicker("refresh");
                   extra_dim_order.selectpicker('show');

                 }
               }
             })
           }
           else{
             extra_dim_order.empty();
             extra_dim_order.selectpicker('refresh');
             extra_dim_order.selectpicker('hide');
           }

           updateWMSLayer2(layernameUI2,layers_style[layernameUI2]);
           $('#show_wms').bootstrapToggle('on');

           // ADD A EVENT LISTENER FOR THE OPCACITY IN THE LAYERS SETTINGS //
           $("#opacity-slider").on("change", function(){
             changeOpacity(layernameUI2,this.value);
             layers_style[layernameUI2]['opacity']= $("#opacity-slider").val();
           });


           // MAKE THE BUTTON MODAL FOR THE INFORMATION OF THE FILE
           // for (let i = 0; i< attributes.length; ++i){
           Object.keys(attr2).forEach(function(i) {

             $(`#${attr2[i]['name']}_${current_tdds_id}_info`).on("click", function(){
               $("#metadata_vars").empty();
               let info_content = get_metadata_button(attr[i]);
               $(info_content).appendTo("#metadata_vars");
             })

             // DEFINE THE LAYER ATTRIBUTES //

             let layernameUI = `${attr2[i]['name']}_${current_tdds_id}`
             layers_style[layernameUI] = {}
             layers_style[layernameUI]['title'] = attr2[i]['name'];
             layers_style[layernameUI]['opacity']= $("#opacity-slider").val();
             layers_style[layernameUI]['wmsURL']= wmsURL;
             layers_style[layernameUI]['style'] = $('#wmslayer-style').val();
             layers_style[layernameUI]['range'] = $('#wmslayer-bounds').val();
             layers_style[layernameUI]['variable'] = attr2[i]['name'];
             layers_style[layernameUI]['subset'] = subsetURL;
             layers_style[layernameUI]['opendap'] = url;
             layers_style[layernameUI]['spatial'] = {};
             layers_style[layernameUI]['epsg'] = attr2[i]['epsg'];
             layers_style[layernameUI]['selected'] = false;
             layers_style[layernameUI]['dimensions'] = attr2[i]['dimensions'];
             layers_style[layernameUI]['extra_dim'] = JSON.parse(result['extra_coordinate']);

             layers_dict_wms = layers_style;

             //ADD A EVENT LISTENER FOR THE OPCACITY IN THE LAYERS SETTINGS //
             $("#opacity-slider").on("change", function(){
               changeOpacity(layernameUI,this.value);
               layers_style[layernameUI]['opacity']= $("#opacity-slider").val();
             });


           })
           $("#GeneralLoading").addClass("hidden");
           last_selected_id = current_tdds_id;
         });

         // remove the added variables //
         $('.attr-checkbox').each(function () {
             if (this.checked) {
               $(this).parent().parent().remove();
             }
         })

          $.notify(
              {
                message: `The Addition of Variables was Sucessful.`
              },
              {
                  type: "success",
                  allow_dismiss: true,
                  z_index: 20000,
                  delay: 5000,
                  animate: {
                    enter: 'animated fadeInRight',
                    exit: 'animated fadeOutRight'
                  },
                  onShow: function() {
                      this.css({'width':'auto','height':'auto'});
                  }
              }
          )
        }
        catch(e){
          $("#GeneralLoading").addClass("hidden");
          $.notify(
              {
                message: `There was an error while adding the variables to the Tredds file.`
              },
              {
                  type: "danger",
                  allow_dismiss: true,
                  z_index: 20000,
                  delay: 5000,
                  animate: {
                    enter: 'animated fadeInRight',
                    exit: 'animated fadeOutRight'
                  },
                  onShow: function() {
                      this.css({'width':'auto','height':'auto'});
                  }
              }
          )
        }
      },
      error:function(e){
        $("#GeneralLoading").addClass("hidden");
        console.log(e);
        $.notify(
            {
              message: `There was an error while adding the variables to the Tredds file.`
            },
            {
                type: "danger",
                allow_dismiss: true,
                z_index: 20000,
                delay: 5000,
                animate: {
                  enter: 'animated fadeInRight',
                  exit: 'animated fadeOutRight'
                },
                onShow: function() {
                    this.css({'width':'auto','height':'auto'});
                }
            }
        )
      }
    })
}


var getTimeseries = function(coord, subsetURL_tempt) {
     if (subsetURL_tempt['opendapURL'] == '') {
         console.log('Please select a data layer.');
     } else {
         // $('#loading-modal').modal('show');
         var maxlat = coord[0][2].lat;
         var maxlng = coord[0][2].lng;
         var minlat = coord[0][0].lat;
         var minlng = coord[0][0].lng;
         var vars = $('#variable-input').val();
         var time = $('#time').val();
         var subsetUrlFull = `${subsetURL_tempt}?var=${vars}&north=${maxlat}&west=${minlng}&east=${maxlng}&south=${minlat}&disableProjSubset=on&horizStride=1&temporal=all`;
         $.ajax({
             url: URL_getBoxValues,
             data: {
                 'subsetURL': subsetUrlFull,
                 'var': vars,
                 'time': time,
             },
             dataType: 'json',
             contentType: "application/json",
             method: 'GET',
             success: function (result) {
                 var data = result['data'];
                 if (data == false) {
                     $('#loading-modal').modal('hide');
                     alert('Invalid dimensions');
                 } else {
                     drawGraph(data);
                     $('#loading-modal').modal('hide');
                     $('#timeseries-modal').modal('show');
                 }
             },
         });
     }
 }


var getSingleTS = function(){
  $.ajax({
      url: 'getSingle-TS',
      data: {
          'containerAttributes': JSON.stringify(containerAttributes),
      },
      dataType: 'json',
      contentType: "application/json",
      method: 'GET',
      success: function (result) {
          let data = result['result'];
          let timeseries = {};
          let htmlVariables = '';
          let i = 1;
          for (let key in data) {
              timeseries[key] = JSON.parse(data[key])
              if (i == 1) {
                  htmlVariables += `<div class="timeseries-variable" data-variable="${key}" onclick="updateSelectedVariable.call(this)" data-selected="true" style="background-color: #4532fc;"><p style="color: white">${key}</p></div>`;
              } else {
                  htmlVariables += `<div class="timeseries-variable" data-variable="${key}" onclick="updateSelectedVariable.call(this)" data-selected="false"><p>${key}</p></div>`;
              }
              i += 1;
          }
          i = 1;
          let htmlFeatures = '';
          for (let feature in timeseries[Object.keys(timeseries)[0]]) {
              if (feature !== 'datetime') {
                  if (i == 1) {
                      htmlFeatures += `<div class="timeseries-features" onclick="updateSelectedFeature.call(this)" data-feature="${feature}" data-selected="true" style="background-color: #4532fc;"><p style="color: white">${feature}</p></div>`;
                  } else {
                      htmlFeatures += `<div class="timeseries-features" onclick="updateSelectedFeature.call(this)" data-feature="${feature}" data-selected="false"><p>${feature}</p></div>`;
                  }
                  i += 1;
              }
          }
          fullArrayTimeseries = timeseries;
          $('#timeseries-variable-div').empty().append(htmlVariables);
          $('#timeseries-feature-div').empty().append(htmlFeatures);
          $('#full-array-modal').modal('show');
          $('#loading-modal').modal('hide');
          drawGraphTwo();
      },
  });
}

var getPlotData = function() {
    let xArray = [];
    let yArray = [];
    for (let key in values_donwload_json['datetime']) {
        xArray.push(values_donwload_json['datetime'][key]);
        yArray.push(values_donwload_json['values'][key]);
    }
    initialize_graphs(xArray, yArray,`${$("#variables_graph").val()} Mean`,`${$("#variables_graph").val()}`,"",`${$("#variables_graph").val()}`,$("#type_graph_select2").val());
}

$('#graph').resizable({containment: "parent", handles: "n"});

var getFullArray= function() {
    let extra_dim = $("#extra_dim").val();
    let extra_epsg = false;
    // let extra_epsg = $("#epsg_change").val();

    let request_obj = {
      group: current_Group,
      tds: current_tdds,
      attr_name:$("#variables_graph").val(),
      input_sptl: input_spatial,
      label_type: $("#features_file").val(),
      behavior_type:  $("#behavior_shp").val(),
      dimensions_sel: $("#dim_select").val(),
      type_ask: type_of_series,
      extra_dim: extra_dim,
      epsg_offset:extra_epsg
    }

   let type_drawing = $("#spatial_input").val();
   let var_val = $("#variables_graph").val();
   if(type_drawing != "sptial_in" &&  var_val != "select_val"){
     $('#GeneralLoading').removeClass('hidden');

     $.ajax({
         url: "getFullArray/",
         data: request_obj,
         dataType: 'json',
         contentType: "application/json",
         method: 'GET',
         success: function (result) {
           try{
             let data = result['result'];
             let timeseries = {};
             let htmlVariables = '';
             let i = 1;
             for (let key in data) {
                 if(data[key].hasOwnProperty('error')){
                   $.notify(
                       {
                         message: ` ${data[key]['error']}`
                       },
                       {
                           type: "info",
                           allow_dismiss: true,
                           z_index: 20000,
                           delay: 5000,
                           animate: {
                             enter: 'animated fadeInRight',
                             exit: 'animated fadeOutRight'
                           },
                           onShow: function() {
                               this.css({'width':'auto','height':'auto'});
                           }
                       }
                   )
                   break;
                   return
                 }
                 timeseries[key] = JSON.parse(data[key]);
                 values_donwload_json = timeseries[key];
                 if(Object.keys(timeseries[key]).length <= 2 ){
                   let xArray = [];
                   let yArray = [];
                   Object.keys(timeseries[key]).forEach(function(key2) {
                      if(key2 != "datetime"){
                        Object.keys(timeseries[key][key2]).forEach(function(key3) {
                          xArray.push(timeseries[key][key2][key3]);
                          yArray.push(timeseries[key]['datetime'][key3]);
                        })
                      }

                    });
                    initialize_graphs(yArray,xArray,`${$("#variables_graph").val()} Mean`,`${$("#variables_graph").val()}`,"",`${$("#variables_graph").val()}`,$("#type_graph_select2").val());
                 }
                 else{
                   graphs_features(timeseries[key],request_obj['attr_name'],$("#type_graph_select2").val());
                 }
             }
             $('#GeneralLoading').addClass('hidden');
           }
           catch(e){
             console.log(e);
             $('#GeneralLoading').addClass('hidden');
             $.notify(
                 {
                   message: `There was an error while retrieving the data from the ${$("#variables_graph").val()} `
                 },
                 {
                     type: "danger",
                     allow_dismiss: true,
                     z_index: 20000,
                     delay: 5000,
                     animate: {
                       enter: 'animated fadeInRight',
                       exit: 'animated fadeOutRight'
                     },
                     onShow: function() {
                         this.css({'width':'auto','height':'auto'});
                     }
                 }
             )
           }


         },
         error: function(e){
           console.log(e);
           $('#GeneralLoading').addClass('hidden');
           $.notify(
               {
                 message: `There was an error while retrieving the data from the ${$("#variables_graph").val()} `
               },
               {
                   type: "danger",
                   allow_dismiss: true,
                   z_index: 20000,
                   delay: 5000,
                   animate: {
                     enter: 'animated fadeInRight',
                     exit: 'animated fadeOutRight'
                   },
                   onShow: function() {
                       this.css({'width':'auto','height':'auto'});
                   }
               }
           )
         }

     });
   }
   if(var_val != "select_val" && type_drawing == "sptial_in"){
     $('#GeneralLoading').addClass('hidden');

     $.notify(
         {
           message: `Please select a Spatial Input Mask to retrieve time series`
         },
         {
             type: "info",
             allow_dismiss: true,
             z_index: 20000,
             delay: 5000,
             animate: {
               enter: 'animated fadeInRight',
               exit: 'animated fadeOutRight'
             },
             onShow: function() {
                 this.css({'width':'auto','height':'auto'});
             }
         }
     )
   }
   if(var_val == "select_val" && type_drawing != "sptial_in"){
     $('#GeneralLoading').addClass('hidden');

     $.notify(
         {
           message: `Please select a Thredds file to be able to see the variables associated to it`
         },
         {
             type: "info",
             allow_dismiss: true,
             z_index: 20000,
             delay: 5000,
             animate: {
               enter: 'animated fadeInRight',
               exit: 'animated fadeOutRight'
             },
             onShow: function() {
                 this.css({'width':'auto','height':'auto'});
             }
         }
     )
   }





}
