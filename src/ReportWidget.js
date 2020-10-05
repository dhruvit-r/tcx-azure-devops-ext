import React from 'react';
import './App.css';
import Iframe from 'react-iframe'
import { getReport } from './services/projects'

/**
 * Render UI for the report widget feature
 */
function Widget() {

  const [projectId, setProjectId] = React.useState(null);
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    VSS.init({ // eslint-disable-line no-undef
      explicitNotifyLoaded: true,
      usePlatformStyles: true
    });

    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) { // eslint-disable-line no-undef
			WidgetHelpers.IncludeWidgetStyles();
            VSS.register("tcx-widget-report", function () { // eslint-disable-line no-undef
                var getQueryInfo = function (widgetSettings) {
                    if (widgetSettings.customSettings.data) {
                      var settings = JSON.parse(widgetSettings.customSettings.data);
                      if (settings && settings.projectId) {
                        VSS.getService(VSS.ServiceIds.ExtensionData).then(dataService => {  // eslint-disable-line no-undef
                          dataService.setValue(VSS.getWebContext().project.id + '_WIDGET_REPORT_PROJECT_ID', settings.projectId, {scopeType: 'User'}); // eslint-disable-line no-undef
                          setProjectId(settings.projectId)
                          getReport(settings.projectId).then(url => {
                            setUrl(url)
                          }).catch(e => {
                            console.error(e);                          
                          })
                        });
                      }
                      else {
                        VSS.getService(VSS.ServiceIds.ExtensionData).then(dataService => {  // eslint-disable-line no-undef
                          dataService.getValue(VSS.getWebContext().project.id + '_WIDGET_REPORT_PROJECT_ID', {scopeType: 'User'}).then(projectId => {  // eslint-disable-line no-undef
                            if (projectId) {
                              setProjectId(projectId)
                              getReport(projectId).then(url => {
                                setUrl(url)
                              }).catch(e => {
                                console.error(e);                          
                              })  
                            }
                          });
                        });
                      }
                    }
                    return WidgetHelpers.WidgetStatusHelper.Success();
                }
                return {
                    load: function (widgetSettings) {
                        return getQueryInfo(widgetSettings);
                    },
                    reload: function (widgetSettings) {
                        return getQueryInfo(widgetSettings);
                    }
                }
            });
            VSS.notifyLoadSucceeded(); // eslint-disable-line no-undef
        });
  }, []);

  return (
    <div className="App">
      {projectId ? 
      <Iframe url={url} width="100%" height="100%"/> : 'No project selected. Please select at the configure menu.'}
    </div>
  );
}

export default Widget;
