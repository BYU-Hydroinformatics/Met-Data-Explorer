var GROUPS_PACKAGE = (function(){

  $(function(){
    $("#btn-check_available_serv").on("click",function(){
      getFoldersAndFiles();
    })
    $('#btn-uplevel').click(function () {
        if (URLpath.length !== 1) {
            let newURL = URLpath[URLpath.length - 2];
            $('#url').val(newURL);
            getFoldersAndFiles();
            URLpath.pop();
        }
    })
    $("#btn-add-addServiceToTable").on("click",addServiceToTable);

    $('#btn-add-addGroup').on("click",function() {
        if ($('#title-input').val() == '') {
            alert('Please specify a name.');
            return
        } else if ($('#description-input').val() == '') {
            alert('Please include a description.');
            return
        } else {
            createDBArray();
            urlInfoBox = false;
        }
    });
    $('#select-all-button').click(function () {
        if ($('#select-all-button').attr('data-select') === 'true') {
            $('#select-all-button').empty();
            $('#select-all-button').html(`<span class="glyphicon glyphicon-check"></span>`);
            $('#select-all-button').attr('data-select', 'false');
            $('.attr-checkbox').each(function () {
                $(this).prop('checked', false);
            });
        } else {
            $('#select-all-button').empty();
            $('#select-all-button').html(`<span class="glyphicon glyphicon-unchecked"></span>`);
            $('#select-all-button').attr('data-select', 'true');
            $('.attr-checkbox').each(function () {
                $(this).prop('checked', true);
            });
        }
    });
    document.getElementById('add-attribute').addEventListener("keyup", searchGroups_group);

    // Display list of Groups in the Delete Groups modal//
    $("#btn-del-groups-f").on("click", make_list_groups);

    // Delete list of Groups in the Delete Groups modal//
    $("#btn-del-hydro-groups").on("click", delete_group_of_hydroservers);

  })

})()

var delete_group_of_hydroservers = function(){
  try{
    let datastring = Object.values($("#tbl-groups").find(".chkbx-group"));
    let groups_to_delete=[];
    datastring.forEach(function(data){
      if(data.checked== true){
        let group_name = data.value;
        groups_to_delete.push(id_dictionary[group_name]);
      }
    });

    if(groups_to_delete.length > 0){
      let groups_to_delete_obj={
        groups:groups_to_delete
      };
      $.ajax({
        type: "POST",
        url: `delete-groups/`,
        dataType: "JSON",
        data: groups_to_delete_obj,
        success: function(result){
          try{
            let groups_to_erase = result.groups;
            let thredds_to_erase = result.thredds;

            $("#pop-up_description2").empty();

            groups_to_erase.forEach(function(group){
              let group_name_e3;
              Object.keys(id_dictionary).forEach(function(key) {
                if(id_dictionary[key] == group ){
                  group_name_e3 = key;
                }
              });
              let element=document.getElementById(group_name_e3);
              element.parentNode.removeChild(element);
              let id_group_separator = `${group_name_e3}_list_separator`;
              let separator = document.getElementById(id_group_separator);
              separator.parentNode.removeChild(separator);
              let group_panel_id = `${group_name_e3}_panel`;
              let group_panel = document.getElementById(group_panel_id);
              group_panel.parentNode.removeChild(group_panel);
              $(`#${group_name_e3}deleteID`).remove();
            });

            thredds_to_erase.forEach(function(thredd_single){
                let new_title;
                Object.keys(id_dictionary).forEach(function(key) {
                  if(id_dictionary[key] == thredd_single ){
                    new_title = key;
                  }
                });
                // map.removeLayer(layersDict[thredd_single]);
                // if (layersDict.hasOwnProperty(thredd_single)){
                //   delete layersDict[thredd_single]
                //   $(`#${new_title}-row-complete`).remove()
                // }
            });
            // if(layersDict['selectedPointModal']){
            //   map.removeLayer(layersDict['selectedPointModal'])
            //   map.updateSize()
            //
            // }
            //
            // if(layersDict['selectedPoint']){
            //   map.removeLayer(layersDict['selectedPoint'])
            //   map.updateSize()
            // }
            //
            // map.updateSize();

              $.notify(
                  {
                      message: `Successfully Deleted Group!`
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
            console.log(e);
            $.notify(
                {
                    message: `We are having an error deleting the selected groups of views`
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
        error: function(error) {
            console.log(error);
            $.notify(
                {
                    message: `We are having an error deleting the selected groups of views`
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
    else{
      $.notify(
          {
              message: `You need to select at least one group to delete`
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
  catch(err){
    $.notify(
        {
            message: `We are having problems tryingto recognize the actual group`
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
}

var make_list_groups = function(){
  try{
    let groupsDiv = $("#current-GroupThredds").find(".panel.panel-default");
    let arrayGroups = Object.values(groupsDiv);
    let finalGroupArray=[];
    // console.log(arrayGroups)
    arrayGroups.forEach(function(g){
      if(g.id){
        let stringGroups = g.id.split("_")[0];
        finalGroupArray.push(stringGroups);
      }
    });
    var HSTableHtml =
        '<table class="table table-condensed-xs" id="tbl-groups"><thead><th>Select</th><th>Catalog Title</th></thead><tbody>'
    if (finalGroupArray.length < 0) {
      $("#modalDeleteGroups").find(".modal-body")
            .html(
                "<b>There are no groups in the Water Data Explorer</b>"
            )
    } else {
        for (var i = 0; i < finalGroupArray.length; i++) {
            var title = finalGroupArray[i]
            HSTableHtml +=
                `<tr id="${title}deleteID">` +
                '<td><input class="chkbx-group" type="checkbox" name="server" value="' +
                title +
                '"></td>' +
                '<td class="hs_title">' +
                id_dictionary[title] +
                "</td>" +
                "</tr>"
        }
        HSTableHtml += "</tbody></table>"
        $("#modalDeleteGroups").find(".modal-body").html(HSTableHtml);
    }
  }
  catch(error){
    $.notify(
        {
            message: `We are having an error trying to make the list of groups in the application`
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

}

var load_groups_start = function(){
    $.ajax({
        type: "GET",
        url: `get-groups-list/`,
        dataType: "JSON",
        success: result => {
           try{
             let groups =result["groups"];

             $(".divForServers").empty() //Resetting the catalog
             ind = 1;
             groups.forEach(group => {
                 let {
                     title,
                     description
                 } = group
                 let unique_id_group = uuidv4()
                 id_dictionary[unique_id_group] = title;

                 let new_title = unique_id_group;
                 let id_group_separator = `${new_title}_list_separator`;


                 $(`#${new_title}-noGroups`).show();

                 let newHtml = html_for_groups(can_delete_groups, new_title, id_group_separator);

                 $(newHtml).appendTo("#current-GroupThredds");


                 let li_object = document.getElementById(`${new_title}`);
                 let input_check = li_object.getElementsByClassName("chkbx-layers")[0];

                 load_individual_thredds_for_group(title);

                 // let servers_checks = document.getElementById(`${id_group_separator}`).getElementsByClassName("chkbx-layers");
                 // input_check.addEventListener("change", function(){
                 //   change_effect_groups(this,id_group_separator);
                 // });
                 //
                 //
                 // let $title="#"+new_title;
                 // let $title_list="#"+new_title+"list";
                 //
                 // $($title).click(function(){
                 //   $("#pop-up_description2").html("");
                 //
                 //   actual_group = `&actual-group=${title}`;
                 //
                 //   let description_html=`
                 //   <h3>Catalog Title</h3>
                 //   <p>${title}</p>
                 //   <h3>Catalog Description</h3>
                 //   <p>${description}</p>`;
                 //   $("#pop-up_description2").html(description_html);
                 //
                 // });
                 ind = ind +1;

             })
           }
           catch(e){
             $("#GeneralLoading").addClass("hidden");
             console.log(e);

             $.notify(
                 {
                     message: `There was an error while loading the Groups`
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
    error: function(error) {
        $("#GeneralLoading").addClass("hidden")
        console.log(error);
        $.notify(
            {
                message: `There was an error while loading the Groups`
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

var addAttribute = function(attribute, dimensionString, units, color) {
    let options = '';
    let dimOptions;
    let html = ''
    let count = $('.attr-checkbox').length;
    if (dimensionString == false) {
      html  += `<tr class="attr-div">
                    <td>
                      <input type="checkbox" class="attr-checkbox" value="${attribute}_${count}" checked id="attribute-${count}">
                    </td>
                    <td class = "attrbute_name">
                      <label for="attribute-${count}">${attribute}</label>
                    </td>
                    <td>
                      <div class = "vertical_buttons">
                      <div>
                        <span class ="glyphicon glyphicon-sort-by-attributes"></span>: <input id = "${attribute}_time" class="tables_mul">
                      </div>
                      <div>
                        <span class = "glyphicon glyphicon-map-marker"></span>: <input id = "${attribute}_location" class="tables_mul">
                      </div>
                      </div>

                    </td>
                  </tr>`
    }
    else{
      let dimensionList = dimensionString.split(',');
      for(let i = 0; i < dimensionList.length; i++) {
          options += `<option>${dimensionList[i]}</option>`;
      }
      html  += `<tr>
                    <td >
                      <input type="checkbox" class="attr-checkbox" checked value="${attribute}_a_${count}" id="attribute-${count}">
                    </td>
                    <td class = "attrbute_name">
                      <label for="attribute-${count}">${attribute}</label>
                    </td>
                    <td>
                      <select id = "${attribute}_time" class="selectpicker tables_mul" data-live-search="false" data-width="50%" data-size="mini" data-style="btn-info">${options}</select>
                    </td>
                  </tr>`
    }


    return html;
}

var addServiceToTable = function(){
  try{
    //CHECKS IF THE INPUT IS EMPTY ///
    if($("#addService-title").val() == ""){
      $.notify(
          {
            message: "Please enter a title. This field cannot be blank."
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

    if ($("#addService-title").val() != "") {
      var regex = new RegExp("^(?![0-9]*$)[a-zA-Z0-9]+$")
      var specials=/[*|\":<>[\]{}`\\()';@&$]/;
      var title = $("#addService-title").val()
      if (specials.test(title)){
        $.notify(
            {
              message: "The following characters are not permitted in the title [ * | \" : < > [ \ ] { } ` \ \ ( ) ' ; @ & $ ]"
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
    }

    //CHECKS IF THERE IS AN EMPTY DESCRIPTION //
    if($("#addService-description").val() == ""){
      $.notify(
          {
            message: "Please enter a description for this group. This field cannot be blank."
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
    var url = $('#url').val();
    var timestamp = 'false';
    let units = 'false';
    let color = 'false';
    let attr = {};
    let variables_list = [];
    $('.attr-checkbox').each(function () {
        if (this.checked) {
            let var_string = $(this).val().split('_a_')[0];
            variables_list.push(var_string);
            let allDimensions = [];
            var x = document.getElementById(`${var_string}_time`);
            if(x != null){
              var i;
              for (i = 0; i < x.length; i++) {
                  allDimensions.push(x.options[i].text);
              }
              attr[var_string] = {
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
                  dimensions: `${time},${location[0]},${location[1]}`,
                  units: units,
                  color: color,
              }
            }


        }
    })
    if(variables_list.length <= 0){
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


    // var group = $("#addGroup-title").val();
    var groupID = 'user-group-container';

    if ($('#epsg-input').val() == '') {
        var epsg = false;
    } else {
        var epsg = $('#epsg-input').val();
    }
    if (spatial_shape == false) {
        if ($('#spatial-input').val() == '') {
            spatial_shape = false;
        } else {
            spatial_shape = $('#spatial-input').val();
        }
    }
    let databaseInfo = {
        type: 'file',
        group: $("#addGroup-title").val(),
        title: $('#addService-title').val(),
        url: url,
        url_wms:wmsURL,
        url_subset:subsetURL,
        epsg: epsg,
        spatial: spatial_shape,
        description: $('#addService-title').val(),
        attributes: attr,
        timestamp: timestamp,
    };
    console.log(databaseInfo);
    add_services_list.push(databaseInfo);
    let options = '';

    for(let i = 0; i< variables_list.length; i++){
      options += `<option>${variables_list[i]}</option>`;
    }
    let html_row = `
    <tr>
      <th scope="row">${add_services_list.length}</th>
      <td>
        <input type="checkbox" class="attr-checkbox" checked value="${$('#addService-title').val()}">
      </td>
      <td>
        ${$('#addService-title').val()}
      </td>
      <td>
        <select id= "${$('#addService-title').val()}_vars" class="selectpicker" data-live-search="false" data-width="fit" data-size="mini" data-style="btn-info">${options}</select>
      </td>
      <td>
        ${url}
      </td>
    </tr>
    `
    $( "#added_thredds_files_table_body").append(html_row);
    $(`#${$('#addService-title').val()}_vars`).selectpicker('refresh');
  }
  catch(error){
    console.log(error);
    $.notify(
        {
          message: `There was an error while adding the THREDDS file and its variables to the Group.`
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
}

var make_varaibles_appear = function () {
    if ($('#url').val() == '') {
        alert('Please enter a url to a Thredds Data Server.')
        return
    } else {
        console.log("now we are");
        // $('#loading-modal').modal('show');
        containerAttributes = false;
        // $('#main-body').css('display', 'none');
        // $('#db-forms').css('display', 'block');
        // $('#name-in-form').append($('#url-input').val());
        let html = '';
        let html2 = '';
        let variables = {};
        $('#variable-input option').each(function () {
            variables[$(this).val()] = $(this).attr('data-dimensions');
        });

        for (let variable in variables) {
            let dimensionString = variables[variable];
          html2 += addAttribute(variable, dimensionString, '', '');
        }
        $(html2).appendTo('#attributes');

        let description = $('#metadata-div').attr('data-description');
        $('#dimensions').append(html);
        $('#description-input').append(description);
        urlInfoBox = true;
        $('#loading-modal').modal('hide');
    }
}

var updateFilepath = function() {
    // $("#loading-modal").modal("show");
    if ($(this).attr("class") == "folder") {
        let newURL = $(this).attr("data-url");
        console.log(newURL);
        $("#url").val(newURL);
        getFoldersAndFiles();
        console.log(URLpath);
    }
    else if ($(this).attr("class") == "file") {
        $('#loading-group').removeClass("hidden");

        console.log((this));
        let newURL = $(this).attr("data-opendap-url");
        console.log(newURL);
        $("#url").val(newURL);
        // $('#name-in-form').attr('data-type', 'file');
        // $("#url").val($(this).text().trim());
        $("#layer-display-container").css("display", "inline");
        // $("#filetree-div").css("display", "none");
        $("#file-info-div").css("display", "flex");
        opendapURL = $(this).attr("data-opendap-url");
        subsetURL = $(this).attr("data-subset-url");
        console.log(subsetURL);
        wmsURL = $(this).attr("data-wms-url");
        if ($("#groups_variables_div").is(":hidden")) {
            console.log($("#groups_variables_div").is(":hidden"));
            let variablesAndFileMetadata = getVariablesAndFileMetadata();
            addVariables(variablesAndFileMetadata[0]);
            make_varaibles_appear();
            $(".tables_mul").selectpicker("refresh");

            addFileMetadata(variablesAndFileMetadata[1]);
            $("#groups_variables_div").show();

            // let variableMetadataArray = variableMetadata();
            // addVariableMetadata(variableMetadataArray);
            //addDimensions(dimensionsAndVariableMetadata[0]);
        }
        else {
          $("#attributes").empty();
          $("#groups_variables_div").hide();

            // addContainerAttributesToUserInputItems();
        }
        // updateWMSLayer();
        console.log(URLpath);

        $('#loading-group').addClass("hidden");

    }
    $("#loading-modal").modal("hide");
}

var variableMetadata = function() {
    var variableMetadata = {};
    let variable = $("#variable-input").val();
    $.ajax({
        url: URL_getVariableMetadata,
        data: {
            variable: variable,
            opendapURL: opendapURL
        },
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        async: false,
        success: function (result) {
            variableMetadata = result["variable_metadata"];
        }
    })
    return [variableMetadata];
}

var addVariables = function(variables) {
    console.log(variables)
    let keys = Object.keys(variables);
    keys.sort();
    let html = "";
    for (let i = 0; i < keys.length; i++) {
        html += `<option data-dimensions="${variables[keys[i]]['dimensions']}" data-units="${variables[keys[i]]['units']}" data-color="${variables[keys[i]]['color']}">${keys[i]}</option>`;
    }
    $("#variable-input").empty()
    $(html).appendTo("#variable-input");

    addDimensions($("#variable-input option:selected").attr('data-dimensions'));
    $("#variable-input").selectpicker("refresh");

}

var addDimensions = function(dimensions) {
    dimensions = dimensions.split(',');
    let html = "";
    for (let i = 0; i < dimensions.length; i++) {
        html += `<option>${dimensions[i]}</option>`;
    }
    $("#time").empty();
    $(html).appendTo("#time");

    $("#time option:contains('time')").attr('selected', 'selected');
    $("#time").selectpicker("refresh");

}

var addVariableMetadata = function(variableMetadata) {
    $("#var-metadata-div").empty().append(variableMetadata);
}

var addFileMetadata = function(fileMetadata) {
    $('#metadata-div').attr('data-description', fileMetadata);
    $(fileMetadata).appendTo("#metadata-div");

    $('#file-metadata-button').css("background-color", "#1600F0");
}

var getVariablesAndFileMetadata = function () {
    //$("#loading-modal").modal("show");
    let variables = {};
    let fileMetadata = '';
    $.ajax({
        url: "getVariablesAndFileMetadata/",
        data: {opendapURL: opendapURL},
        dataType: "json",
        contentType: "application/json",
        method: "GET",
        async: false,
        success: function (result) {
            variables = result["variables_sorted"];
            fileMetadata = result["file_metadata"];
        }
    })
    return [variables, fileMetadata];
}

var getFoldersAndFiles = function() {
  let elementForm= $("#modalAddServiceForm");
  let datastring= elementForm.serialize();
  let form_elements = datastring.split("&");
  let url_alone = form_elements[form_elements.length -1]
  $('#name-in-form').attr('data-type', 'folder');
  $('#loading-group').removeClass("hidden");
    $.ajax({
        url: 'getFilesAndFolders/',
        data: url_alone,
        dataType: "HTML",
        type: "GET",
        success: function (data) {
            var result = JSON.parse(data);
            console.log(result);
            $("#folders_structures").show();

            var dataTree = result["dataTree"];
            if (dataTree == "Invalid URL") {
                console.log(dataTree);
            }
            else {
                $("#filetree-div").css("display", "block");
                // $("#file-info-div").css("display", "none");
                var correctURL = result["correct_url"];
                let html =
                `<tbody>`

                console.log(dataTree);
                console.log(Object.keys(dataTree["files"]).length );
                if(Object.keys(dataTree["files"]).length !== 0){
                  for (var file in dataTree["files"]) {
                      html += `
                      <tr>
                      <td>
                      <div data-wms-url="${dataTree["files"][file]["WMS"]}"
                                data-subset-url="${dataTree["files"][file]["NetcdfSubset"]}"
                                data-opendap-url="${dataTree["files"][file]["OPENDAP"]}"
                                class="file" onclick="updateFilepath.call(this)">
                                <span class="glyphicon glyphicon-file" style="height: 20px; margin: 5px 10px 5px 10px"></span>
                                <p style="padding: 5px 5px 5px 0px">${file}</p></div>
                        </td>
                      </tr>`
                  }

                }

                for (var folder in dataTree["folders"]) {
                    html += `
                    <tr>
                    <td> <div data-url="${dataTree["folders"][folder]}" class="folder"
                     onclick="updateFilepath.call(this)">
                     <span class="glyphicon glyphicon-folder-open" style="height: 20px; margin: 5px 10px 5px 10px"></span>
                     <p style="padding: 5px 5px 5px 0px">${folder}</p></div>
                    </td>
                    </tr>
                    `
                }
                html += `</tbody>`
                $("#available_services").removeClass("hidden");
                $("#filetree-div").empty();
                // .append(html);
                $(html).appendTo(`#filetree-div`);
                $("#url").val(correctURL);
                if (URLpath[URLpath.length - 1] !== correctURL) {
                    URLpath.push(correctURL);
                }
            }
            // $("#loading-modal").modal("hide");
            $('#loading-group').addClass("hidden");

        },
        error: function(error){
          $('#loading-group').addClass("hidden");
          $.notify(
              {
                  message: `Invalid THREDDS Endpoint`
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
};

var createDBArray = function() {
  try{
    //CHECKS IF THE INPUT IS EMPTY ///
    if($("#addGroup-title").val() == ""){
      $.notify(
          {
            message: "Please enter a title. This field cannot be blank."
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

    if ($("#addGroup-title").val() != "") {
      var regex = new RegExp("^(?![0-9]*$)[a-zA-Z0-9]+$")
      var specials=/[*|\":<>[\]{}`\\()';@&$]/;
      var title = $("#addGroup-title").val()
      if (specials.test(title)){
        $.notify(
            {
              message: "The following characters are not permitted in the title [ * | \" : < > [ \ ] { } ` \ \ ( ) ' ; @ & $ ]"
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
    }

    //CHECKS IF THERE IS AN EMPTY DESCRIPTION //
    if($("#addGroup-description").val() == ""){
      $.notify(
          {
            message: "Please enter a description for this group. This field cannot be blank."
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

    let group_info = {
        title: $('#addGroup-title').val(),
        description: $('#addGroup-description').val(),
        attributes: add_services_list,
    };
    console.log(group_info);

    $.ajax({
        url: "add-group/",
        dataType: 'json',
        data: {data: JSON.stringify(group_info)},
        type: 'POST',
        success: function (data) {
          add_services_list = [];
          console.log(data);
          let unique_id_group = uuidv4();
          id_dictionary[unique_id_group] = $('#addGroup-title').val();
          let group = data
          // let title=group.title;
          let title=group.title;
          let description=group.description;
          let new_title = unique_id_group;
          let id_group_separator = `${new_title}_list_separator`;
          let newHtml = html_for_groups(can_delete_groups, new_title, id_group_separator);
          $(newHtml).appendTo("#current-GroupThredds");
          $(`#${title}-noGroups`).show();
          let li_object = document.getElementById(`${new_title}`);
          let input_check = li_object.getElementsByClassName("chkbx-layers")[0];

          if(!input_check.checked){
            // //console.log("HERE NOT CHECKEC")
            load_individual_thredds_for_group(title);
          }
//           overflow-x: scroll;
// width: 100%;
// height: 500px;
          // input_check.addEventListener("change", function(){
          //   change_effect_groups(this,id_group_separator);
          // });
          $("#GeneralLoading").addClass("hidden")

          // $("#modalAddGroupServer").modal("hide")
          $("#modalAddGroupServerForm").each(function() {
              this.reset();
          })

          $("#modalAddServiceForm").each(function() {
              this.reset();
          });
          $("#added_thredds_files_table_body").empty();
          $("#groups_variables_div").hide();

          $("#filetree-div").empty();
          $("#folders_structures").hide();


          $.notify(
              {
                message: `Successfully Created Group of THREDDS to the database`
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
          $("#modalAddGroupThredds").modal("hide");
          // $("#rows_servs").empty();
          // $("#available_services").hide();

        }
    })
  }
  catch(error){
    add_services_list = [];

    console.log(error);
    $.notify(
        {
          message: `There was an error while adding the group of THREDDS files`
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
}

var general_search = function(id_search_input, id_table){
  try{
    input = document.getElementById(`${id_search_input}`);
    filter = input.value.toUpperCase();
    table = document.getElementById(`${id_table}`);

    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
  catch(error){
    $.notify(
        {
            message: `We are having a problem trying doing the search `
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

}

// for only one group
var searchGroups_group = function() {

  try{
    general_search("add-attribute","attributes_table");
  }
  catch(error){
    console.log(error);
  }
}