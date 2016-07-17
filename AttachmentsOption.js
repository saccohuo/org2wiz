var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var omOptionFileName = org_mode_pluginPath + "options.ini";
var omAttachmentsOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "AttachmentsOption");
// objWindow.ShowMessage(omAttachmentsOption.toString(), "omOptionFileName",0);
var tempConfirm = 0;

var newomAttachmentsOption = objCommon.GetIntValue2("附件选项", "值为0，不自动添加同名 pdf 和 tex 文件到附件\n值为1，自动添加同名 pdf 和 tex 文件到附件", parseInt(omAttachmentsOption,10), 0, 1, tempConfirm);
// objWindow.ShowMessage(tempConfirm.toString(), "omOptionFileName",0);
// objWindow.ShowMessage(newomAttachmentsOption.toString(), "omOptionFileName",0);
// objWindow.ShowMessage(typeof newomAttachmentsOption, "omOptionFType",0);
if(newomAttachmentsOption == 0 || newomAttachmentsOption == 1){
  objCommon.SetValueToIni(omOptionFileName, "Options", "AttachmentsOption", newomAttachmentsOption);
}
