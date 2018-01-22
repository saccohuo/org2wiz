var objDB = objApp.Database;
var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
// var objCommon = objApp.CreateActiveXObject("WizKMControls.WizCommonUI");
var objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI"); // CreateWizObject 是内部对象，CreateActiveXObject 是外部对象
// objWindow.ShowMessage(objCommon.toString(), "objCommon",0);
// objCommon.OptionsDlg(0);
var omOptionFileName = org_mode_pluginPath + "options.ini";
// var omOptionFileName = org_mode_pluginPath.replace(/\\/g,'\\\\') + "options.ini";
// objWindow.ShowMessage(omOptionFileName.toString(), "omOptionFileName",0);


//-------------Init button complete-----------------------
InitOMButton();



//--------------- check attachment complete---------------

function OnOMButtonClicked(){
  //判断当前 Document 的后缀转换成纯小写是不是 .org
  if(MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase() != '.org')
    return;

  var omEncodingOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "OrgEncodingOption");
  var templateFilename = "Default-UTF8.org";

  if(parseInt(omEncodingOption,10) == 0){
    templateFilename = "Default-UTF8.org";
  }else if(parseInt(omEncodingOption,10) == 1){
    templateFilename = "Default-UTF8-BOM.org";
  }else if(parseInt(omEncodingOption,10) == 2){
    templateFilename = "Default-GBK.org";
  }else{
    templateFilename = "Default-UTF8.org";
  }

  if(objWindow.CurrentDocument.AttachmentCount==0){
    AddOrgAttach(objWindow.CurrentDocument,templateFilename);
    return;
  }
  else{
  }



  var orgAttach = GetOrg(objWindow.CurrentDocument) + ".org";
  // objWindow.ShowMessage(orgAttach, "Debug orgAttach",0);

  // 如果找不到 org 附件，返回值是空的，orgAttach 就等于 ".org"
  if(orgAttach == ".org"){
    AddOrgAttach(objWindow.CurrentDocument,templateFilename);
    // objWindow.ShowMessage(orgAttach, "Debug orgAttach is empty",0);
    return;
  }
  // // 已经修改为找到 org 文件才可以，还需要修改来让插件自动找到合适的 org 附件，或者找到多个的情况提示选择
  // var AttachCount = objWindow.CurrentDocument.Attachments.Count;
  // var OrgFile = 0;
  // // 此处还可以使用 _NewEnum 然后使用 for_each 结构
  // for (var AttachNum = 0; AttachNum < AttachCount; AttachNum++ ) {
  //   OrgFile =  objWindow.CurrentDocument.Attachments.Item(AttachNum).FileName;
  //   if(MFGetFileExtension(OrgFile).toLowerCase() == '.org')
  //     break;
  // }

  // if(MFGetFileExtension(OrgFile).toLowerCase() != '.org'){
  //   objWindow.ShowMessage("There is no org file in this document!", "Warning",0);
  //   return;
  // }

  // objWindow.ShowMessage(omOptionFileName, "omOptionFileName",0);
  // objWindow.ShowMessage(omMJOption, "testvar",0);

  // objWindow.ShowMessage("testforini1", "testforini1",0);

  // var omDefaultTag = objCommon.GetValueFromIni(omOptionFileName, "Options", "DefaultTag");
  // objCommon.OptionsDlg(0);
  // objWindow.ShowMessage(testforini, "testforini",0);

  // objWindow.ShowMessage(DefaultTag, "DefaultTag",0);

  // 直接设置成online了，为了方便html文件在浏览器打开
  var omMJOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "MathJaxOption");
  // var omMJOption = "online";
  // objWindow.ShowMessage(omMJOption, "omMJOption",0);
  var omDefaultTag = objCommon.GetValueFromIni(omOptionFileName, "Options", "DefaultTag");

  var offlineMJpath = org_mode_pluginPath.replace(/\\/g,'/') + "MathJax/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML";
  // objWindow.ShowMessage(offlineMJpath.toString(), "offlineMJpath",0);

  // emacs --batch -q --no-site-file --visit "test.org" --eval="(setq org-html-mathjax-template \"\")(setq org-html-mathjax-options '((path \"https://cdn.mathjax.org/mathjax/latest/MathJax.js\?config=TeX-AMS-MML_HTMLorMML\")(scale \"100\")(align \"center\")(indent \"2em\")(mathml nil)))" --funcall org-html-export-to-html
  // 终于解决了 emacs -q 生成 html 时候 MathJax 的 Online 路径替换问题。还需要解决生成的 html 被导入到为知的文档中时替换为本地临时路径的问题
  // 这个字符串是在 cmd 里面直接执行的时候需要的字符串，再下面那一行是对这一行进行了一次转义。
  // cmd 中对左右尖括号的转义用上三角 ^ ，而不是用反斜杠 \ 。问号在 cmd 中需要转义，在 shell 中不需要转义
  // 作为新手写这些真的好累。 What The Fuck String and Escape
  // strMJpath = "(setq org-html-mathjax-options '((path \"https://cdn.mathjax.org/mathjax/latest/MathJax.js\?config=TeX-AMS-MML_HTMLorMML\")(scale \"100\")(align \"center\")(indent \"2em\")(mathml nil)))(setq org-html-mathjax-template \"^<script type=\\\"text/javascript\\\" src=\\\"%PATH\\\"^>^</script^>\")";
  // var strOnlinePath = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))";
  var strOnlinePath = "(setq org-html-mathjax-options '((path \\\"https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js\\?config=TeX-MML-AM_CHTML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))";
  var strOfflinePath = "(setq org-html-mathjax-options '((path \\\"" + offlineMJpath +  "\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))";
  var strMJTpl = "(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";
  var strNoMJTpl = "(setq org-html-mathjax-template \\\"\\\")";

  // 不知道为什么这三个 emacs 参数的路径和模板顺序设置还不太一样，没有 mathjax 的模板要放在路径设置前面，其他的反之
  var strOnlineMJ = strOnlinePath + strMJTpl;
  var strOfflineMJ = strOfflinePath + strMJTpl;
  var strNoMJ = strNoMJTpl + strOnlinePath;
  var strMJSetting = strNoMJ;
  // strOnlineMJ = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";
  // strNoMJ = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\\\")";
  // strOfflineMJ = "(setq org-html-mathjax-options '((path \\\"" + offlineMJpath +  "\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";

  
  // objWindow.ShowMessage(omMJOption, "Debug omMJOption",0);

  if(omMJOption.toLowerCase() == "no"){
    strMJSetting = strNoMJ;
  }
  else if(omMJOption.toLowerCase() == "online"){
    strMJSetting = strOnlineMJ;
  }
  else if(omMJOption.toLowerCase() == "offline"){
    strMJSetting = strOfflineMJ;
  }
  else{
    strMJSetting = strNoMJ;
  }

  var strCmd = "emacs.exe";
  var strParam = " --batch -q --no-site-file --visit \"" + orgAttach + "\" --eval=\"" + strMJSetting + "\" --funcall org-html-export-to-html";
  // objWindow.ShowMessage(strParam, "strParam",0);
  

  objCommon.RunExe(strCmd, strParam, true);

  var HtmlFile = orgAttach.replace(/\.org$/i,'.html');
  if(!objCommon.PathFileExists(HtmlFile))
    return;

  // objWindow 的对象类型就是为知笔记主窗口对象 (IWizExplorerWindow)
  // objWindow.CurrentDocument 的对象类型是 WizDocument
  // 获得/设置文档的类型，例如document，note，journal，contact等等
  // 为什么设置为 wholewebpage？没找到介绍有这个类型的位置
  // objWindow.CurrentDocument.Type = "wholewebpage";

  // 更改文档数据，通过一个HTML文件名和对应的URL来更新。
  // nFlags 的值设置为 0x0006，表示“显示进度”和“包含 html 中的脚本”
  // 可以使用 UpdateDocument、UpdateDocument5 和 UpdateDocument6 来更新文档数据，但是更新的时候资源管理器不要打开为知的 temp 文件夹

  objWindow.CurrentDocument.UpdateDocument(HtmlFile, 0x0004); // 不包含脚本，只显示进度
  // objWindow.CurrentDocument.UpdateDocument(HtmlFile, 0x0006); //包含脚本，显示进度
  // objWindow.CurrentDocument.UpdateDocument(HtmlFile, 0x0000);
  // objWindow.CurrentDocument.UpdateDocument6(HtmlFile, HtmlFile, 0x0006);
  // objWindow.CurrentDocument.UpdateDocument5(HtmlFile);

  // 注释掉下面这句话，让为知在生成 html 加入到文档中之后不再删除 html 文件
  // objCommon.RunExe("cmd ", "/c del /f /q \""+HtmlFile+"\"", true);

  // add default tag (now it is just one allowed)
  if(omDefaultTag != "" && omDefaultTag != "noTag"){
    // var newTagObj = objDB.CreateRootTag(omDefaultTag, "");
    // objWindow.CurrentDocument.AddTag(newTagObj);
    
    var allTags = objDB.Tags;
    // 现在我还不会用这个 enum 的对象，如果会用的话应该更简单，不需要 for循环
    var allTagsEnum = allTags._NewEnum;
    var sameTagFlag = 0;
    var sameTagObj = 0;
    // objWindow.ShowMessage(sameTagFlag.toString(), "sameTagFlag",0);

    // testFunc(allTags);
    // allTagsEnum.foreach(testFunc);

    //function testFunc(tagCollection){
      for(var i=0; i<allTags.Count; i++){
        if(allTags.Item(i).Name == omDefaultTag){
          sameTagFlag = 1;
          sameTagObj = allTags.Item(i);
          break;
        }
      }
    // }
    
    // objWindow.ShowMessage(sameTagFlag.toString(), "sameTagFlag",0);

    if(sameTagFlag != 0){
      objWindow.CurrentDocument.AddTag(sameTagObj);
    }
    else{
      var newTagObj = objDB.CreateRootTag(omDefaultTag, "");
      objWindow.CurrentDocument.AddTag(newTagObj);
    }
    // 另一种方法是获取所有标签名字，然后用正则找出在两个分号之间是否有与默认标签相同的字符串
    // var allTagsName = objDB.GetAllTagsName();
    // objWindow.ShowMessage(allTagsName, "Tags",0);
  }

  otw_MarkAsMathjax();
}

//-------------- Add Org2Wiz button and function OnOMButtonClicked-----------------------
function InitOMButton(){
  // var languangeFileName = org_mode_pluginPath + "plugin.ini";
  objWindow.AddToolButton("document", "OMButton", "Org2Wiz", "", "OnOMButtonClicked");

  var omAttachmentsOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "AttachmentsOption");
  if(parseInt(omAttachmentsOption,10)){
    objWindow.AddToolButton("document", "OMAttach", "AddAttach", "", "OnOMAttachClicked");
  }
}

function OnOMAttachClicked(){
  var omAttachmentsOption = objCommon.GetValueFromIni(omOptionFileName, "Options", "AttachmentsOption");
  
  var curDoc = objWindow.CurrentDocument;
  if(curDoc.AttachmentCount==0)
    return;
  var orgName = GetOrg(curDoc);
  var attachPath = curDoc.AttachmentsFilePath;
  // objWindow.ShowMessage("testbefore", "Debug",0);
  // objWindow.ShowMessage(orgName, "Debug orgName",0);
  // objWindow.ShowMessage(omAttachmentsOption.toString(), "Debug omAttachmentsoption",0);

  if(orgName != "" && omAttachmentsOption != 0){
    // objWindow.ShowMessage("testafter", "Debug",0);
    // objWindow.ShowMessage(orgName + ".tex", "Debug .tex",0);
    if(omAttachmentsOption == 1 || omAttachmentsOption == 2){
      var texFile = curDoc.AddAttachment(orgName + ".tex");
    }
    if(omAttachmentsOption == 2){
      var pdfFile = curDoc.AddAttachment(orgName + ".pdf");
    }
  }
  else{
    return;
  }
}

//---------------------------------------------------------------



//---------------------Get org file from the document attachments-------------
function GetOrg(curDoc){
  // 后续还需要检查附件是否下载到本地 Downloaded API
  // 已经修改为找到 org 文件才可以，还需要修改来让插件自动找到合适的 org 附件，或者找到多个的情况提示选择
  var AttachCount = curDoc.Attachments.Count;
  var OrgFilename = 0;
  var OrgName = 0;
  if(AttachCount==0)
    return;
  // 此处还可以使用 _NewEnum 然后使用 for_each 结构
  for (var AttachNum = 0; AttachNum < AttachCount; AttachNum++ ) {
    OrgFilename =  curDoc.Attachments.Item(AttachNum).FileName;
    if(MFGetFileExtension(OrgFilename).toLowerCase() == '.org'){
      OrgName =  OrgFilename.replace(/.org$/, ''); 
      break;
    }
  }
  // objWindow.ShowMessage(OrgName, "Debug",0);

  if(MFGetFileExtension(OrgFilename).toLowerCase() == '.org'){
    return OrgName;
  }
  else {
    // objWindow.ShowMessage("There is no org file in this document!", "Warning",0);
    return "";
  }
}

//---------------------Add .org Attachment for new .org Document----------------
function AddOrgAttach(curDoc,templateFilename){
  var newomOrgAttach = objCommon.InputBox("org 文件名", "请输入需要添加的 org 附件的文件名（可包含或不包含 .org 后缀，但必须为 Windows 文件名允许的字符串）：", "default");
  if(MFGetFileExtension(newomOrgAttach).toLowerCase() != '.org'){
    newomOrgAttach = newomOrgAttach + ".org";
  }
  else{
    newomOrgAttach = newomOrgAttach;
  }

  var templateFileRelativePath = "Templates/";
  var TemplateFile = org_mode_pluginPath + templateFileRelativePath + templateFilename;
  var attachPath;
  var destinationFile;

  // 确认该 Document 没有包含 org 附件
  if(newomOrgAttach != "" && newomOrgAttach != ".org"){
    // 先添加一个附件到 Document，防止没有创建附件文件夹
    var localTemplateFileHdl = curDoc.AddAttachment(TemplateFile);
    attachPath = curDoc.AttachmentsFilePath;
    var localTemplateFile = attachPath + templateFilename;
    destinationFile = attachPath + newomOrgAttach;
    // 附件文件夹下，复制模板附件文件到org附件文件
    objCommon.CopyFile(localTemplateFile,destinationFile);
    // 重命名附件文件名
    // objCommon.RunExe("cmd", "/c ren \"" + localTemplateFile + "\" \"" + newomOrgAttach + "\"", true);
    //添加新附件
    var localOrgFileHdl = curDoc.AddAttachment(destinationFile);
    //删除原附件
    localTemplateFileHdl.Delete();
  }
  else{
    objWindow.ShowMessage("输入的文件名 "+ newomOrgAttach + "错误", "Error-org-attach-filename",0);
  }
  return;
}


//-------------------Add Mathjax to Document-----------------------
//-----------------------------------------------------------------
function otw_MarkAsMathjax(){
  // var objWindow = objApp.Window;
  var objDocument = objWindow.CurrentDocument;
  // alert("test1");
  if (objDocument) {
    objDocument.Type = "Mathjax";
    // alert("objDocument.Type");
    // alert(objDocument.Type);
    objApp.AddGlobalScript(objApp.CurPluginAppPath + "MathjaxCurrentDocument.js");
    // alert(objApp.CurPluginAppPath);
  }
}

function insertScript(){
  var elem = document.createElement("script");
  elem.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML";
  document.head.appendChild(elem);
}

// 还需要解决 html 带脚本update的情况，不带脚本的情况可以直接用 insertScript
// 想要带脚本的情况，最好加个 Tools 来设置 UpdateDocument 时的 flag 参数
function replaceScript(){
  var new_elem = document.createElement("script");
  new_elem.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML";

  var src_list = document.querySelectorAll("script");
  // var src_list = document.getElementsByTagName("script");
  var div_list = document.querySelectorAll("div#MathJax_Message");
  for(var i=0;i<src_list.length;i++){
    var src_str = src_list[i].getAttribute("src");
    var text_str = src_list[i].textContent;
    // alert("src_str");
    // alert(src_str);
    var str_match_cdn = (src_str!=null) ? src_str.match(/^index_files\/MathJax_\d+\.js$/) : null;
    var str_match_hub = (text_str!=null) ? text_str.match(/MathJax\.Hub\.Config/) : null;
    // alert(str_match_head);
    // alert(str_match_body);
    // alert("str_match");
    // alert(str_match);
    // if(str_match_cdn!=null || str_match_hub!=null){
    if(str_match_cdn!=null){
      alert("src_str");
      alert(src_str);
      alert("str_match");
      alert(str_match_cdn);
      // document.head.replaceChild(new_elem,src_list[i]);
      document.head.removeChild(src_list[i]);
      // src_list[i].src=new_elem.src;
      // alert(src_list[i].getAttribute("src"));
      // return 1;
    }
  }

  // if(div_list!=null)
  //   document.body.removeChild(div_list[0]);

  document.body.appendChild(new_elem);
  // return 1;
}


function otw_addMathjaxScript() {
  // if (!doc)
  //   return;

  // alert("document");
  // alert(document);
  // var elem = document.createElement("script");
  // elem.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML";
  // alert("elem");
  // alert(elem);
  // org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org2Wiz.js");
  // var scriptfile=org_mode_pluginPath+"docsrc.js";
  var doc = objApp.Window.CurrentDocumentBrowserObject;
  // alert("docbroswer");
  // alert(doc);

  // alert("insertscript");
  doc.ExecuteScript(insertScript.toString(),function(){
    // doc.ExecuteFunction0("replaceScript", function(ret){
    //   alert(ret);
    // });
    doc.ExecuteFunction0("insertScript", null);
  });

  // alert("afterscript");
}

function otw_addMathjaxScriptToCurrentDocument() {
  // alert("doc1");
  otw_addMathjaxScript();
}

function otw_onHtmlDocumentCompleted(doc) {
  // alert("update1");

  try {
    var objDocument = objApp.Window.CurrentDocument;
    // alert(objDocument);

    if (objDocument) {
      if (objDocument.Type == "Mathjax") {
        // alert(objDocument.Type);
        otw_addMathjaxScript();
      }
    }
  }
  catch (err) {
  }
}



//-----------------------------------------------------------------
//-----------------------------------------------------------------
//下面的函数我不知道是干嘛的，也不知道哪里来的

//--------------------------------------------
// 这个地方似乎没有考虑没有后缀名的文件
function MFGetFileExtension(Fstr){
  pos = Fstr.lastIndexOf('.');
  if(pos == -1)
    return "";
  else
    return Fstr.substr(pos);
}
function MFIsIE(){
  if(navigator.userAgent.indexOf("MSIE")>0)
    return true;
  else
    return false;
}
function MFins_elem(doc, part, elem_type, callbackfunc){
  var oPart = doc.getElementsByTagName(part).item(0); 
  var oElem = doc.createElement(elem_type); 
  callbackfunc(oElem);
  //oHead.appendChild(oElem); 
  oPart.insertBefore(oElem,null); //because IE bug, use insertBefore;
  return oElem;
}

function MFAppendScriptSrc(doc, part, script_type, str){

  MFins_elem(doc, part, "script", function(oScript) {
                                  oScript.type = script_type; 
                                  oScript.defer = true;
                                  oScript.src = ("file:///" +  str).replace(/\\/g,'/'); 
                                  }
  );
}

function MFAppendCssSrc(doc, str){
  MFins_elem(doc, 'HEAD', "link", function(oCss) {
                                  oCss.rel = "stylesheet"; 
                                  oCss.href = ("file:///" +  str).replace(/\\/g,'/'); 
                                  }
  );
}

function MFAppendInnerHtml_IE6(doc, part, innerHtmlStr){
  MFins_elem(doc, part, "div",  function(oDiv) {
                                oDiv.id= "TmpIdForAppendScriptInnerHtml1";
                                oDiv.innerHTML =  "<input type=\"hidden\" id=TmpIdForAppendScriptInnerHtml2>"+innerHtmlStr; 
                                }
  );
  var oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml1');
  oElem.removeNode(false);
  oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml2');
  oElem.removeNode(true);
}

function MFAppendInnerHtml_IE6WithW3CAPI(doc, part, innerHtmlStr)
{ //The implementation seems strange, because it need to compatible with IE6 and above and wibkit
  MFins_elem(doc, part, "div",  function(oDiv) {
                                oDiv.id= "TmpIdForAppendScriptInnerHtml1";
                                oDiv.innerHTML =  "<input type=\"hidden\" id=TmpIdForAppendScriptInnerHtml2>"+innerHtmlStr; 
                                }
  );
  var oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml1');
  while(oElem.firstChild)  {
    oElem.parentNode.insertBefore(oElem.firstChild,oElem);  
  }
  oElem.parentNode.removeChild(oElem);//oElem.removeNode(false);
  oElem=doc.getElementById('TmpIdForAppendScriptInnerHtml2');
  oElem.parentNode.removeChild(oElem);//oElem.removeNode(true);
}

function MFAppendStyleInnerHtml(doc, str){
  try{
    MFins_elem(doc, 'HEAD', "style", function(oCss) {
                                    oCss.type = "text/css"; 
                                    oCss.innerHTML = str; 
                                    }
    );
  }catch(ex){
    MFAppendInnerHtml_IE6(doc, 'head', '<style type="text/css">'+str+'</style>');
  }
}

function MFAppendScriptInnerHtml(doc, part, script_type,innerHtmlStr)
{ 
  try{
    MFins_elem(doc, part, "script", function(oCss) {
                                    oCss.type = script_type; 
                                    oCss.innerHTML = innerHtmlStr; 
                                    }
    );
  }catch(ex){
    MFAppendInnerHtml_IE6(doc, part, "<script defer=\"true\" type=\"" + script_type + "\">" + innerHtmlStr + "</scr" + "ipt>");
  }
}

//----------------------------------------------------------------------
function MFAppendMathJaxConfig(doc){
  var innerHtmlStr = "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\\\(','\\\\)']]}}); \
                      MathJax.Hub.Config({tex2jax: {displayMath: [ ['$$','$$'], [\"\\\\[\",\"\\\\]\"], [\"\\\\begin{displaymath}\",\"\\\\end{displaymath}\"] ]}});\
                      MathJax.Hub.Config({ TeX: { equationNumbers: {autoNumber: \"all\", useLabelIds: true} } });  \
                      MathJax.Hub.Config({ TeX: { extensions: [\"cancel.js\"] } });\
                     "; 
  MFAppendScriptInnerHtml(doc, 'BODY', "text/x-mathjax-config", innerHtmlStr);
}

function MFInitMathJax(doc){
  //http://docs.mathjax.org/en/v1.1-latest/configuration.html
  MFAppendMathJaxConfig(doc); // A simple MathJax configuration for test 
  
  //the 1st method to load mathjax, can speed up the processing
  //AppendScriptSrc('HEAD', "text/javascript", "MathJax\\MathJax.js?config=Accessible&delayStartupUntil=configured");
  //AppendScriptInnerHtml('BODY', "text/javascript", "MathJax.Hub.Configured();");
  
  //the 2nd method
  MFAppendScriptSrc(doc, 'BODY', "text/javascript", org_mode_pluginPath+"MathJax\\MathJax.js?config=Accessible");
}
