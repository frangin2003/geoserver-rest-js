"use strict"

$(function() {

    var workspaceHot = $("#workspaces-data-grid").handsontable(
    {
        rowHeaders: true,
        //manualColumnMove: true,
        //manualRowMove: true,
        minSpareRows: 1,
        startRows: 1,
        persistentState: true,
        //colWidths: [55, 80, 80, 80, 80, 80, 80],
        colHeaders: [
            "Workspace"
        ],
        columns: [
            {data: "workspaceName"}
        ]
    });

    var postgisHot = $("#postgis-data-grid").handsontable(
    {
        rowHeaders: true,
        //manualColumnMove: true,
        //manualRowMove: true,
        minSpareRows: 1,
        startRows: 1,
        persistentState: true,
        //colWidths: [55, 80, 80, 80, 80, 80, 80],
        colHeaders: [
            "Workspace",
            "Name",
            "Host",
            "Port",
            "Database",
            "User",
            "Password"
        ],
        columns: [
            {data: "workspaceName"},
            {data: "dsName"},
            {data: "dsHost"},
            {data: "dsPort"},
            {data: "dsDatabase"},
            {data: "dsUser"},
            {data: "dsPasswd"}

        ]
    });
    
    var dsShapesHot = $("#ds-shapes-data-grid").handsontable(
    {
        rowHeaders: true,
        //manualColumnMove: true,
        //manualRowMove: true,
        minSpareRows: 1,
        startRows: 1,
        persistentState: true,
        //colWidths: [55, 80, 80, 80, 80, 80, 80],
        colHeaders: [
            "Workspace",
            "Shape directory"
        ],
        columns: [
            {data: "workspaceName"},
            {data: "shapeDirectory"}
        ]
    });

    var layersHot = $("#layers-data-grid").handsontable(
    {
        rowHeaders: true,
        //manualColumnMove: true,
        //manualRowMove: true,
        minSpareRows: 1,
        startRows: 1,
        persistentState: true,
        //colWidths: [55, 80, 80, 80, 80, 80, 80],
        colHeaders: [
            "Workspace",
            "Datastore",
            "Layer name",
            "SRS",
            "Style name",
            "Style filename"
        ],
        columns: [
            {data: "workspaceName"},
            {data: "dsName"},
            {data: "layerName"},
            {data: "srsCode"},
            {data: "styleName"},
            {data: "styleFilename"}

        ]
    });

    $(".play-rest-requests").click(function() {

        var settings = {
            host: $("#host").val(),
            port: $("#port").val(),
            auth: $("#auth").val(),
            login: $("#login").val(),
            password: $("#password").val(),
            alwaysExecuteCallback: true
        };

        var requests = [];


        var workspaceHotData = workspaceHot.handsontable("getData");
        for(var i = 0; i < workspaceHotData.length; i++) {
            
            var data = workspaceHotData[i];

            if (data.workspaceName) {
                requests.push({method: "deleteWorkspace", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
                requests.push({method: "addWorkspace", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
            }
        }

        var postgisHotData = postgisHot.handsontable("getData");
        for(var i = 0; i < postgisHotData.length; i++) {
            
            var data = postgisHotData[i];

            if (data.dsName) {
                requests.push({method: "addPostgisDatastore", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
            }
        }

        var dsShapesHotData = dsShapesHot.handsontable("getData");
        for(var i = 0; i < dsShapesHotData.length; i++) {
            
            var data = dsShapesHotData[i];

            if (data.shapeDirectory) {
                requests.push({method: "addShapeDatastore", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
            }
        }

        var layersHotData = layersHot.handsontable("getData");
        for(var i = 0; i < layersHotData.length; i++) {
            
            var data = layersHotData[i];

            if (data.styleName) {
                requests.push({method: "addStyle", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
            }

            if (data.layerName) {
                requests.push({method: "addFeatureType", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
            }

            if (data.layerName && data.styleName) {
                requests.push({method: "setLayerStyle", settings: $.extend(true, {}, $.extend(true, {}, data), settings)});
            }
        }

        var executeRequests = function(requests) {

            if (requests && requests.length > 0) {

                (function() {
                    var requestTmp = requests.shift();

                    geoserver[requestTmp.method](requestTmp.settings, function() {executeRequests(requests);});
                })();
            }
        }

        executeRequests(requests);
    });
});
