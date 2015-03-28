"use strict";

/**
 * Object managing GeoServer REST API.
 *
 */
var geoserver = {

    defaults : {
        host: "localhost",
        port: "8080",
        auth: "basic",
        login: "admin",
        password: "geoserver",
        recurse: true,
        complete: {},
        alwaysExecuteCallback: false
    },

    setSettingsDefaults: function(settings) {

        settings = $.extend(true, {}, $.extend(true, {}, geoserver.defaults), settings);

        settings.url = "http://" + settings.host + ":" + settings.port + "/geoserver/";

        return settings;
    },

    /**
     * geoserver.listWorkspaces({port:"8081"}, function(workspacesList) {console.log(workspacesList);})
     */
    listWorkspaces: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces";
        settings.type = "GET";
        settings.complete["200"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Workspaces list");

            var workspacesList = [];
            $(xhr.responseText).find("li").each(function() {

                workspacesList.push({
                    name: $(this).find("a").html(),
                    htmlPage: $(this).find("a").attr("href"),
                    default : ($(this).html().indexOf("[default]") > -1)
                });
            });

            geoserver.log(workspacesList);

            if (callback) callback(workspacesList);
        };

        geoserver.ajax(settings);
    },

/*
<namespace>
  <id>NamespaceInfoImpl--504ecfff:1325fe8cf16:-7fff</id>
  <prefix>osm_base</prefix>
  <uri>http://opengeo.org/osm_base</uri>
</namespace>

<workspace>
  <id>WorkspaceInfoImpl--504ecfff:1325fe8cf16:-8000</id>
  <name>osm_base</name>
</workspace>
*/
    /**
     * geoserver.addWorkspace({port:"8081",workspaceName:"gilbert"}, function() {console.log("OK!");})
     */
    addWorkspace: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces";
        settings.type = "POST";
        settings.contentType = "text/xml";
        settings.data = "<workspace><name>" + settings.workspaceName + "</name></workspace>";

        settings.complete["201"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Workspace '" + settings.workspaceName + "' created");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Workspace '" + settings.workspaceName + "' creation failure");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },

    /**
     * geoserver.getWorkspace({port:"8081",workspaceName:"gilbert"}, function() {console.log("OK!");})
     */
    getWorkspace: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/" + settings.workspaceName;
        settings.type = "GET";
        //settings.quietOnNotFound = false;
        settings.complete["200"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Workspace information '" + settings.workspace + "'");

            var workspace = {name: settings.workspaceName, datastores: []};
            $(xhr.responseText).find("li").each(function() {

                workspace.datastores.push({
                    name: $(this).find("a").html(),
                    htmlPage: $(this).find("a").attr("href")
                });
            });

            geoserver.log(workspace);

            if (callback) callback(workspace);
        };

        geoserver.ajax(settings);
    },

    /**
     * geoserver.deleteWorkspace({port:"8081",workspaceName:"gilbert"}, function() {console.log("OK!");})
     */
    deleteWorkspace: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/" + settings.workspaceName + "?recurse=true";
        settings.type = "DELETE";
        settings.complete["200"] = function(xhr, textStatus) {
                            
            geoserver.log("GeoServer - Workspace '" + settings.workspaceName + "' deleted");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Workspace '" + settings.workspaceName + "' deletion failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },

    /**
     * geoserver.getDefaultWorkspace({port:"8081"}, function() {console.log("OK!");})
     */
    getDefaultWorkspace: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/default";                
        settings.type = "GET";
        //settings.quietOnNotFound = false;
        settings.complete["200"] = function(xhr, textStatus) {

            var workspace = {datastores: []};
            $(xhr.responseText).find("li").each(function() {

                workspace.datastores.push({
                    name: $(this).find("a").html(),
                    htmlPage: $(this).find("a").attr("href")
                });
            });

            geoserver.log(workspace);

            if (callback) callback(workspace);
        };

        geoserver.ajax(settings);
    },

    /**
     * geoserver.addShapeDatastore({port:"8081",workspaceName:"gilbert",shapeFilename:"data/shapefiles/"}, function() {console.log("OK!");})
     */
    addShapeDatastore: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/" + settings.workspaceName + "/datastores/shapefiles/external.shp?configure=all";
        settings.type = "PUT";
        settings.contentType = "text/plain";
        settings.data = "file:///" + settings.shapeDirectory;

        settings.complete["201"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Shapefiles datastore '" + settings.shapeDirectory + "' of workspace '" + settings.workspaceName + "' created");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Shapefiles datastore '" + settings.shapeDirectory + "' of workspace '" + settings.workspaceName + "' creation failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },
/*
<dataStore>
  <id>DataStoreInfoImpl--504ecfff:1325fe8cf16:-7ffe</id>
  <name>osm_base_shapefiles</name>
  <type>Directory of spatial files (shapefiles)</type>
  <enabled>true</enabled>
  <workspace>
    <id>WorkspaceInfoImpl--504ecfff:1325fe8cf16:-8000</id>
  </workspace>
  <connectionParameters>
    <entry key="memory mapped buffer">false</entry>
    <entry key="timezone">sun.util.calendar.ZoneInfo[id=&quot;America/New_York&quot;,offset=-18000000,dstSavings=3600000,useDaylight=true,transitions=235,lastRule=java.util.SimpleTimeZone[id=America/New_York,offset=-18000000,dstSavings=3600000,useDaylight=true,startYear=0,startMode=3,startMonth=2,startDay=8,startDayOfWeek=1,startTime=7200000,startTimeMode=0,endMode=3,endMonth=10,endDay=1,endDayOfWeek=1,endTime=7200000,endTimeMode=0]]</entry>
    <entry key="create spatial index">true</entry>
    <entry key="charset">ISO-8859-1</entry>
    <entry key="filetype">shapefile</entry>
    <entry key="cache and reuse memory maps">true</entry>
    <entry key="url">file:///benchmarking/wms/2011/data/vector/osm_base_data/data</entry>
    <entry key="namespace">http://www.openplans.org/topp</entry>
  </connectionParameters>
  <__default>false</__default>
</dataStore>

<dataStore>
<id>DataStoreInfoImpl-228e74db:13258e54bb4:-7ffe</id>
<name>postgis</name>
<type>PostGIS</type>
<enabled>true</enabled>
<workspace>
<id>WorkspaceInfoImpl-228e74db:13258e54bb4:-8000</id>
</workspace>
<connectionParameters>
<entry key="Connection timeout">20</entry>
<entry key="port">5432</entry>
<entry key="dbtype">postgis</entry>
<entry key="host">linux_db_bm</entry>
<entry key="validate connections">false</entry>
<entry key="encode functions">false</entry>
<entry key="max connections">20</entry>
<entry key="database">osm</entry>
<entry key="namespace">http://geoserver.org/pg</entry>
<entry key="schema">public</entry>
<entry key="Loose bbox">true</entry>
<entry key="Expose primary keys">false</entry>
<entry key="fetch size">10000</entry>
<entry key="Max open prepared statements">200</entry>
<entry key="preparedStatements">false</entry>
<entry key="Estimated extends">true</entry>
<entry key="user">postgres</entry>
<entry key="min connections">20</entry>
</connectionParameters>
<__default>false</__default>
</dataStore>
*/
    /**
     * geoserver.addPostgisDatastore({port:"8081",workspaceName:"gilbert",
          dsName:"gilbert",dsHost:"localhost",dsPort:"5432",dsDatabase:"geospanc_isigny",dsUser:"postgres",dsPasswd:"postgres"}, function() {console.log("OK!");})
     */
    addPostgisDatastore: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/" + settings.workspaceName + "/datastores";
        settings.type = "POST";
        settings.contentType = "text/xml";
        settings.data =
            "<dataStore>" +
                "<name>" + settings.dsName + "</name>" +
                "<connectionParameters>" +
                    "<host>" + settings.dsHost + "</host>" +
                    "<port>" + settings.dsPort + "</port>" +
                    "<database>" + settings.dsDatabase + "</database>" +
                    "<user>" + settings.dsUser + "</user>" +
                    "<passwd>" + settings.dsPasswd + "</passwd>" +
                    "<dbtype>postgis</dbtype>" +
                "</connectionParameters>" +
            "</dataStore>";

        settings.complete["201"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Datastore '" + settings.dsName + "' of workspace '" + settings.workspaceName + "' created");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Datastore '" + settings.dsName + "' of workspace '" + settings.workspaceName + "' creation failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },

/*
<featureType>
  <id>FeatureTypeInfoImpl--504ecfff:1325fe8cf16:-7ff7</id>
  <name>shoreline_300</name>
  <nativeName>shoreline_300</nativeName>
  <namespace>
    <id>NamespaceInfoImpl--504ecfff:1325fe8cf16:-7fff</id>
  </namespace>
  <title>shoreline_300</title>
  <nativeCRS>GEOGCS[&quot;GCS_WGS_1984&quot;, 
  DATUM[&quot;D_WGS_1984&quot;, 
    SPHEROID[&quot;WGS_1984&quot;, 6378137.0, 298.257223563]], 
  PRIMEM[&quot;Greenwich&quot;, 0.0], 
  UNIT[&quot;degree&quot;, 0.017453292519943295], 
  AXIS[&quot;Longitude&quot;, EAST], 
  AXIS[&quot;Latitude&quot;, NORTH]]</nativeCRS>
  <srs>EPSG:4326</srs>
  <nativeBoundingBox>
    <minx>-2.0037508E7</minx>
    <maxx>2.0037508E7</maxx>
    <miny>-2.0057508E7</miny>
    <maxy>1.8464390667E7</maxy>
    <crs>EPSG:4326</crs>
  </nativeBoundingBox>
  <latLonBoundingBox>
    <minx>-2.0037508E7</minx>
    <maxx>2.0037508E7</maxx>
    <miny>-2.0057508E7</miny>
    <maxy>1.8464390667E7</maxy>
    <crs>EPSG:4326</crs>
  </latLonBoundingBox>
  <projectionPolicy>FORCE_DECLARED</projectionPolicy>
  <enabled>true</enabled>
  <metadata>
    <entry key="cachingEnabled">false</entry>
  </metadata>
  <store class="dataStore">
    <id>DataStoreInfoImpl--504ecfff:1325fe8cf16:-7ffe</id>
  </store>
  <maxFeatures>0</maxFeatures>
  <numDecimals>0</numDecimals>
</featureType>
*/
    /**
     * geoserver.addFeatureType({port:"8081",workspaceName:"gilbert",
          dsName:"gilbert",layerName:"geo_assainissement"}, function() {console.log("OK!");})
     */
    addFeatureType: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/" + settings.workspaceName
                    + "/datastores/" + settings.dsName + "/featuretypes";
        settings.type = "POST";
        settings.contentType = "text/xml";
        settings.data =   "<featureType><name>" + settings.layerName + "</name></featureType>";

        settings.complete["201"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Layer '" + settings.layerName + "' of datastore '" + settings.dsName + "' of workspace '" + settings.workspaceName + "' created");

            if (settings.srsCode) {

                geoserver.modifyFeatureType(settings, callback);

            } else if (callback) {
                callback();
            }
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Layer '" + settings.layerName + "' of datastore '" + settings.dsName + "' of workspace '" + settings.workspaceName + "' creation failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },

    /**
     * geoserver.addFeatureType({port:"8081",workspaceName:"gilbert",
          dsName:"gilbert",layerName:"geo_assainissement"}, function() {console.log("OK!");})
     */
    modifyFeatureType: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/workspaces/" + settings.workspaceName
                    + "/datastores/" + settings.dsName + "/featuretypes/" + settings.layerName;
        settings.type = "PUT";
        settings.contentType = "text/xml";
        settings.recalculate = "nativebbox,latlonbbox";
        settings.data =   "<featureType>"
            + "<enabled>true</enabled>"
            + "<srs>EPSG:" + settings.srsCode + "</srs>"
            + "<projectionPolicy>FORCE_DECLARED</projectionPolicy>"
            + "</featureType>";

        settings.complete["200"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Layer '" + settings.layerName + "' of datastore '" + settings.dsName + "' of workspace '" + settings.workspaceName + "' modified");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Layer '" + settings.layerName + "' of datastore '" + settings.dsName + "' of workspace '" + settings.workspaceName + "' creation failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },
/*
<layer>
  <name>shoreline_300</name>
  <id>LayerInfoImpl--504ecfff:1325fe8cf16:-7ff6</id>
  <type>VECTOR</type>
  <defaultStyle>
    <id>StyleInfoImpl--5ef4cc4:132610111db:-7ffb</id>
  </defaultStyle>
  <resource class="featureType">
    <id>FeatureTypeInfoImpl--504ecfff:1325fe8cf16:-7ff7</id>
  </resource>
  <enabled>true</enabled>
  <metadata>
    <entry key="GWC.autoCacheStyles">true</entry>
    <entry key="GWC.metaTilingX">4</entry>
    <entry key="GWC.metaTilingY">4</entry>
    <entry key="GWC.gutter">0</entry>
    <entry key="GWC.enabled">true</entry>
    <entry key="GWC.cacheFormats">image/png,image/jpeg</entry>
    <entry key="GWC.gridSets">EPSG:4326,EPSG:900913</entry>
  </metadata>
  <attribution>
    <logoWidth>0</logoWidth>
    <logoHeight>0</logoHeight>
  </attribution>
</layer>
*/

    /**
     * geoserver.addStyle({port:"8081",styleName:"gilbert_style",styleFilename:"gilbert.sld"}, function() {console.log("OK!");})
     */
    addStyle: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/styles";
        settings.type = "POST";
        settings.contentType = "text/xml";
        settings.data = "<style><name>" + settings.styleName + "</name><filename>" + settings.styleFilename + "</filename></style>";

        settings.complete["201"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Style '" + settings.styleName + "' created");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Style '" + settings.styleName + "' creation failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },

    /**
     * geoserver.setLayerStyle({port:"8081",workspaceName:"gilbert",layerName:"geo_parcelle",styleName:"gilbert_style"}, function() {console.log("OK!");})
     */
    setLayerStyle: function(settings, callback) {

        settings = geoserver.setSettingsDefaults(settings);

        settings.url += "rest/layers/" + settings.workspaceName + ":" + settings.layerName;

        settings.type = "PUT";
        settings.contentType = "text/xml";
        settings.data = "<layer><defaultStyle><name>" + settings.styleName + "</name><workspace>" + settings.workspaceName + "</workspace></defaultStyle></layer>";

        settings.complete["200"] = function(xhr, textStatus) {

            geoserver.log("GeoServer - Association of style '" + settings.styleName + "' to layer '" +  settings.layerName + "' successfull");

            if (callback) callback();
        };
        settings.complete["error"] = function(xhr, textStatus) {
            geoserver.error("GeoServer - Association of style '" + settings.styleName + "' to layer '" +  settings.layerName + "' failed");
            if (settings.alwaysExecuteCallback && callback) callback();
        };

        geoserver.ajax(settings);
    },

    ajax: function(settings) {
        $.ajax({
            type: settings.type,
            url: settings.url,
            contentType: settings.contentType,
            data: settings.data,
            beforeSend: function( xhr ) {

                if (settings.auth == "basic") {
                    xhr.setRequestHeader ("Authorization", "Basic "
                        + geoserver.base64Encode(
                                settings.login + ":" 
                                + settings.password));
                }
            },
            complete: function(xhr, textStatus) {

                if (settings.complete[xhr.status]) {
                    settings.complete[xhr.status](xhr, textStatus);
                } else {

                    geoserver.warn(xhr);
                    geoserver.warn(xhr.responseText);
                    geoserver.warn(textStatus);

                    settings.complete["error"](xhr, textStatus);
                }
            }
        });
    },

    base64Encode: function (str) {
        
        if (! str) {
            geoserver.warn("str is empty !");

            return null;
        }

        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        var out = "", i = 0, len = str.length, c1, c2, c3;
        
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += CHARS.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += CHARS.charAt(c3 & 0x3F);
        }
        
        return out;
    },

    log: function(message) {
    
        console && console.log(message);
    },

    warn: function(message) {

        console && console.warn(message);
    },

    error: function(message) {

        console && console.error(message);
    }
};
