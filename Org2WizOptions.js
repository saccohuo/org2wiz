var objApp = WizExplorerApp;
var objWindow = objApp.Window;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var CustomOptionFile = "custom.ini";
var OptionFile = "options.ini";
var CurOptionFile = (objCommon.PathFileExists(org_mode_pluginPath + CustomOptionFile)) ? CustomOptionFile : OptionFile;
var omOptionFileName = org_mode_pluginPath + CurOptionFile;
var DialogFile = org_mode_pluginPath + 'optionsdialog.htm';
var MsgFile = org_mode_pluginPath + 'msgdialog.htm';


// alert(omOptionFileName);
var omDefaultTag = string_trim(objCommon.GetValueFromIni(omOptionFileName, "Options", "DefaultTag"));
var omAttachmentsOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "AttachmentsOption");
var omEncodingOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "OrgEncodingOption");
var omMJOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "ScriptOption");
var omTagOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "TagOption");
var omHtmlOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "HtmlOption");
var omCopyDate = objCommon.GetValueFromIni(omOptionFileName, "Options", "CopyDate");

// alert(omDefaultTag);
var ParamArray = new Array();
ParamArray[0] = omDefaultTag;
ParamArray[1] = omAttachmentsOption;
ParamArray[2] = omEncodingOption;
ParamArray[3] = omMJOption;
ParamArray[4] = omTagOption;
ParamArray[5] = omHtmlOption;
ParamArray[6] = omCopyDate;

objWindow.ShowHtmlDialogEx(false, "Org2Wiz 选项", DialogFile, 500, 370, "", ParamArray, function(ret){
  // objWindow.ShowMessage(typeof ret, "typeof ret",0);

  if(ret != null){
    // alert(ret);
    // objWindow.ShowMessage(ret[0], "ret[0]",0);
    // objWindow.ShowMessage(ret[1], "ret[1]",0);
    // objWindow.ShowMessage(ret[2], "ret[2]",0);
    // objWindow.ShowMessage(ret[3], "ret[3]",0);

    var NewDefaultTag = string_trim(ret[0]);
    var NewAttachmentsOption = ret[1];
    var NewEncodingOption = ret[2];
    var NewMJOption = ret[3];
    var NewTagOption = ret[4];
    var NewHtmlOption = ret[5];
    var NewCopyDate = ret[6];

    if(omDefaultTag !== NewDefaultTag)
      objCommon.SetValueToIni(omOptionFileName, "Options", "DefaultTag", NewDefaultTag);
    if(omAttachmentsOption !== NewAttachmentsOption)
      objCommon.SetValueToIni(omOptionFileName, "Options", "AttachmentsOption", NewAttachmentsOption);
    if(omEncodingOption !== NewEncodingOption)
      objCommon.SetValueToIni(omOptionFileName, "Options", "OrgEncodingOption", NewEncodingOption);
    if(omMJOption !== NewMJOption)
      objCommon.SetValueToIni(omOptionFileName, "Options", "ScriptOption", NewMJOption);
    if(omTagOption !== NewTagOption)
      objCommon.SetValueToIni(omOptionFileName, "Options", "TagOption", NewTagOption);
    if(omHtmlOption !== NewHtmlOption)
      objCommon.SetValueToIni(omOptionFileName, "Options", "HtmlOption", NewHtmlOption);
    if(omCopyDate !== NewCopyDate)
      objCommon.SetValueToIni(omOptionFileName, "Options", "CopyDate", NewCopyDate);

    objWindow.ShowHtmlDialogEx(false, "Org2Wiz 选项", MsgFile, 300, 200, "", null, function(msg){});
  }
});
// alert('test');

function string_trim(str){
  if(typeof str === 'string'){
    var strArray = str.split(';');
    strArray = strArray.filter(el => el.trim() != ''); // for ES2015
    // strArray = strArray.map(el => el.trim()); // for ES2015
    str = strArray.join(';');
    return str;
  }
  return '';
}
