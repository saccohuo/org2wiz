var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var omOptionFileName = org_mode_pluginPath + "options.ini";
var omMJOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "MathJaxOption");
// objWindow.ShowMessage(omOptionFileName.toString(), "omOptionFileName",0);

var newomMJOption = objCommon.InputBox("MathJax 设置", "No 不使用 MathJax；\n Online 使用在线 MathJax；\n Offline 使用本地 MathJax。\n 对大小写不敏感。", omMJOption);
if(newomMJOption != ""){
  objCommon.SetValueToIni(omOptionFileName, "Options", "MathJaxOption", newomMJOption.toLowerCase());
}
