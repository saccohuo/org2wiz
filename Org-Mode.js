var org_mode_pluginPath = objApp.GetPluginPathByScriptFileName("Org-Mode.js");

//-------------- Add Org2Wiz button and function OnOMButtonClicked-----------------------
function InitOMButton(){
  var languangeFileName = org_mode_pluginPath + "plugin.ini";
  objWindow.AddToolButton("document", "OMButton", "Org2Wiz", "", "OnOMButtonClicked");
}

//-------------- Add mdExport button and function OnmdExportButtonClicked-----------------------
// function InitmdExportButton(){
//   var languangeFileName = org_mode_pluginPath + "plugin.ini";
//   objWindow.AddToolButton("document", "mdExportButton", "mdExport", "", "OnmdExportButtonClicked");
// }

//-------------Init button complete-----------------------
InitOMButton();
//InitmdExportButton();


//--------------- check attachment complete---------------

function OnOMButtonClicked(){ 
  if(MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase() != '.org')
    return;
    
  if(objWindow.CurrentDocument.AttachmentCount==0)
    return;

  // 已经修改为找到 org 文件才可以，还需要修改来让插件自动找到合适的 org 附件，或者找到多个的情况提示选择
  var AttachCount = objWindow.CurrentDocument.Attachments.Count;
  var OrgFile = 0;
  // 此处还可以使用 _NewEnum 然后使用 for_each 结构
  for (var AttachNum = 0; AttachNum < AttachCount; AttachNum++ ) {
    OrgFile =  objWindow.CurrentDocument.Attachments.Item(AttachNum).FileName;
    if(MFGetFileExtension(OrgFile).toLowerCase() == '.org')
      break;
  }

  if(MFGetFileExtension(OrgFile).toLowerCase() != '.org')
      return;

  var offlineMJpath = org_mode_pluginPath.replace(/\\/g,'/') + "MathJax/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML";
  // objWindow.ShowMessage(offlineMJpath.toString(), "handle of doc",0);
  
  // 终于解决了 emacs -q 生成 html 时候 MathJax 的 Online 路径替换问题。还需要解决生成的 html 被导入到为知的文档中时替换为本地临时路径的问题
  // 这个字符串是在 cmd 里面直接执行的时候需要的字符串，再下面那一行是对这一行进行了一次转义。
  // cmd 中对左右尖括号的转义用上三角 ^ ，而不是用反斜杠 \ 。问号在 cmd 中需要转义，在 shell 中不需要转义
  // 作为新手写这些真的好累。 What The Fuck String and Escape
  // strMJpath = "(setq org-html-mathjax-options '((path \"https://cdn.mathjax.org/mathjax/latest/MathJax.js\?config=TeX-AMS-MML_HTMLorMML\")(scale \"100\")(align \"center\")(indent \"2em\")(mathml nil)))(setq org-html-mathjax-template \"^<script type=\\\"text/javascript\\\" src=\\\"%PATH\\\"^>^</script^>\")";
  strOnlineMJpath = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";
  strnoMJpath = "(setq org-html-mathjax-options '((path \\\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\\?config=TeX-AMS-MML_HTMLorMML\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\\\")";
  strOfflineMJpath = "(setq org-html-mathjax-options '((path \\\"" + offlineMJpath +  "\\\")(scale \\\"100\\\")(align \\\"center\\\")(indent \\\"2em\\\")(mathml nil)))(setq org-html-mathjax-template \\\"\^\<script type=\\\\\\\"text/javascript\\\\\\\" src=\\\\\\\"%PATH\\\\\\\"\^\>\^\</script\^\>\\\")";

  strCmd = "emacs.exe";
  strParam = " --batch -q --no-site-file --visit \"" + OrgFile + "\" --eval=\"" + strnoMJpath + "\" --funcall org-html-export-to-html";
  objWindow.ShowMessage(strParam, "handle of doc",0);
  

  objCommon.RunExe(strCmd, strParam, true);

  var HtmlFile = OrgFile.replace(/\.org$/i,'.html'); 
  if(!objCommon.PathFileExists(HtmlFile))
    return;

  // objWindow 的对象类型就是为知笔记主窗口对象 (IWizExplorerWindow)
  // objWindow.CurrentDocument 的对象类型是 WizDocument
  // 获得/设置文档的类型，例如document，note，journal，contact等等
  // 为什么设置为 wholewebpage？没找到介绍有这个类型的位置
  objWindow.CurrentDocument.Type = "wholewebpage";

  // 更改文档数据，通过一个HTML文件名和对应的URL来更新。
  // nFlags 的值设置为 0x0006，表示“显示进度”和“包含 html 中的脚本”
  // 可以使用 UpdateDocument、UpdateDocument5 和 UpdateDocument6 来更新文档数据，但是更新的时候资源管理器不要打开为知的 temp 文件夹
  objWindow.CurrentDocument.UpdateDocument(HtmlFile, 0x0006);
  // objWindow.CurrentDocument.UpdateDocument6(HtmlFile, HtmlFile, 0x0006);
  // objWindow.CurrentDocument.UpdateDocument5(HtmlFile);

  // 注释掉下面这句话，让为知在生成 html 加入到文档中之后不再删除 html 文件
  // objCommon.RunExe("cmd ", "/c del /f /q \""+HtmlFile+"\"", true);
}

// function OnmdExportButtonClicked(){
// //  var ext = MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase();
// //  if (ext != '.mdp' && ext !='.org')
// //    return;
    
//   var exportfilename = objWindow.CurrentDocument.Title.replace(MFGetFileExtension(objWindow.CurrentDocument.Title), ".export");
//   objWindow.CurrentDocument.Type = "wholewebpage";
  
//   var objFolder = objDatabase.GetFolderByLocation("/Export/", true);
//   var objDoc = objFolder.CreateDocument2(exportfilename, "");
//   objDoc.ChangeTitleAndFileName(exportfilename);
//   objDoc.Type = "wholewebpage";
  
  
// ///////////////////////// convert outer css file into embeded style
//   var csstxt_all="";
//   for ( var i = 0; i < objWindow.CurrentDocumentHtmlDocument.styleSheets.length; i++ ){
//     try{
//     	for(var j=0; j<objWindow.CurrentDocumentHtmlDocument.styleSheets.item(i).cssRules.length; j++)
//         csstxt_all+= objWindow.CurrentDocumentHtmlDocument.styleSheets.item(i).cssRules[j].cssText;
//     }catch(ex){
//     	csstxt_all+= objWindow.CurrentDocumentHtmlDocument.styleSheets.item(i).cssText;
//     }
//   }
//   oLinks=objWindow.CurrentDocumentHtmlDocument.getElementsByTagName('link');
//   for(var i=0; i< oLinks.length; i++){
//     if(oLinks.item(i).rel=='stylesheet')
//       try{oLinks.item(i).parentNode.removeChild(oLinks.item(i));} catch(ex){oLinks.item(i).removeNode(true);}
//   }
//   oStyles=objWindow.CurrentDocumentHtmlDocument.getElementsByTagName('style');
//   for(var i=0; i< oStyles.length; i++){
//     try{oStyles.item(i).parentNode.removeChild(oStyles.item(i));} catch(ex){oStyles.item(i).removeNode(true);}
//   }
//   MFAppendStyleInnerHtml(objWindow.CurrentDocumentHtmlDocument, csstxt_all);
// ////////////////////////  

//   //objDoc.UpdateDocument2(objWindow.CurrentDocumentHtmlDocument, 0x24);
//   objDoc.UpdateDocument4('<html>'+objWindow.CurrentDocumentHtmlDocument.documentElement.innerHTML+'</html>',"", 0x4);
  
//   WizAlert("Export Ok!");
// }

//---------------------------------------------------------------
// eventsHtmlDocumentComplete.add(OnOrgHtmlDocumentComplete);

function OnOrgHtmlDocumentComplete(doc){
  try {
    var file_ext = MFGetFileExtension(objWindow.CurrentDocument.Title).toLowerCase();
    // if(objCommon.GetValueFromIni(org_mode_pluginPath + "plugin.ini", "Plugin_0", "EnableMarkdown") == '1' && 
    // file_ext == '.mdp')
    //   MFInitMarkdown(doc);

    if(objCommon.GetValueFromIni(org_mode_pluginPath + "plugin.ini", "Plugin_0", "EnableMathJax") == '1' &&
       (file_ext == '.org')){
      // 这个地方似乎一直没调用，因为没看到有js被添加到html文件中
      // OM_addMathjaxScript(doc);

      // 如果是用的 IE，直接进行处理，如果不是的话，在 500ms 之后进行处理。处理方法： MFInitMathJax(doc)
      // setTimeout(code,millisec) 方法用于在指定的毫秒数后调用函数或计算表达式。
      // if(MFIsIE())
      //   MFInitMathJax(doc);
      // else
      //   setTimeout(function(){MFInitMathJax(doc);},4000);
    }
  }
  catch (err) {
    }
}



//--------------------------------Wiz Official MathJax Code---------------------
function OM_addMathjaxScript(doc) {
  if (!doc){
    objWindow.ShowMessage("Html Object doc is empty", "Error",0);
    return;
  }
  // objWindow.ShowMessage(doc.scripts.item(0).text, "handle of doc",0);
  // objWindow.ShowMessage(doc.scripts.item(1).text, "handle of doc",0);
  // objWindow.ShowMessage(doc.scripts.item(2).text, "handle of doc",0);
  // objWindow.ShowMessage(doc.scripts.item(3).text, "handle of doc",0);
  // objWindow.ShowMessage(doc.scripts.item(4).text, "handle of doc",0);
  
  
  
  
  var elem = doc.createElement("script");
  elem.src = "http://cdn.mathjax.org/mathjax/latest/MathJax.js\?config=TeX-AMS-MML_HTMLorMML";
  doc.body.appendChild(elem);
  objWindow.CurrentDocument.UpdateDocument2(doc, 0x0006);
}

function OM_addMathjaxScriptToCurrentDocument() {
  var doc = objWindow.CurrentDocumentHtmlDocument;
  
  if(!doc){
    //   objWindow.ViewHtml("file:////D:/MyDocuments/My Knowledge/Data/shuaike945@gmail.com/Test/orgmodemathjaxtest.org_Attachments/blank.html", false);
    objWindow.ShowMessage("Object doc is empty", "Error",0);
   }
  OM_addMathjaxScript(doc);
}

function OM_onHtmlDocumentCompleted(doc) {
  try {
    // 获得的 doc 是一个 WizDocument 对象，而不是 IHTMLDocument2 对象，而要进行 element_add script 必须得是 html对象
    var objDocument = objWindow.CurrentDocument;
    var exdoc = objWindow.CurrentDocumentHtmlDocument;
    if (objDocument) {
      // objWindow.ShowMessage("Wiz Object doc is not empty", "Normal",0);
      // objWindow.ShowMessage(exdoc.body.toString(), "handle of doc",0);
      OM_addMathjaxScript(exdoc);
    }
  }
  catch (err) {
  }
}

eventsHtmlDocumentComplete.add(OM_onHtmlDocumentCompleted);

//-----------------------------End Wiz Official MathJax Code---------------------



//-----------------------------------------------------------------
//-----------------------------------------------------------------
//--------------------------------------------
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
//------------------------------------------------------------------------
//------------------------------------------------------------
/* Choose Which version of Markdown*/

// function MFParseMarkdownContent(objHtmDoc,MarkdownFunction){
//   var title = objHtmDoc.title; 
//   if (MFGetFileExtension(title).toLowerCase() == '.mdp'){
//     //var a=objHtmDoc.getElementById('WizHtmlContentId'); 

//     var objImgs = objHtmDoc.getElementsByTagName('img'); 
//     for(var i=0; i<objImgs.length; i++)    {
//       var oImg = objImgs.item(i);
//       var oElem= objHtmDoc.createElement("div"); 
//       oElem.innerHTML = "<input type=\"hidden\">!["+ oImg.src + "](" + oImg.src + ")"; 
//       oImg.parentNode.insertBefore( oElem, oImg);
//     }    
    
//     var a=objHtmDoc.getElementsByTagName('BODY').item(0); 
//     var innerText=a.innerText;
//     innerText=innerText.replace(/ \\\\ /ig,' \\\\\\\\ ');

//     var md_reg_DoItalicsAndBold_31 = new RegExp(
//           '(((?!\\w)[\\s\\S]|^)\\${1,2})'
//         + '(?=\\S)'
//         + '(?!_\\$)'
//         +  '([^\\$]+?)'
//         +  '_'
//         +  '([^\\$]+?)'
//         +  '_'
//         +  '([^\\$]+?)'
//         + '\\${1,2}'
//         + '(?!\\w)'
//         , "g" );
//     innerText=innerText.replace(md_reg_DoItalicsAndBold_31, "$1$3\\_$4\\_$5$1").replace(/(\r\n){2}/g, "\r\n");
    
//     a.innerHTML=(MarkdownFunction(innerText));
//     var codeBlocks = objHtmDoc.getElementsByTagName("code");
//     for (var i = 0; i < codeBlocks.length; i++){
//       hljs.highlightBlock(codeBlocks[i], '    ');
//     }
//   }
// }

// function MFInitMarkdown(doc){
//   MarkdownImplementation="MFInit_" + objCommon.GetValueFromIni(org_mode_pluginPath + "plugin.ini", "Plugin_0", "MarkdownImplementation")+"(doc);";
//   eval(MarkdownImplementation);
// }
// //-----------------------------------------------------------------

// function MFInit_js_markdown_extra(doc){
//   MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\js_markdown_extra\\js-markdown-extra.js"); 
//   MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\js_markdown_extra\\highlight.pack.js");
//   MFAppendCssSrc(doc, org_mode_pluginPath+"Markdown\\js_markdown_extra\\GitHub2.css");
//   MFAppendCssSrc(doc, org_mode_pluginPath+"Markdown\\js_markdown_extra\\md.css");
  
//   if(MFIsIE())
//     MFAppendScriptInnerHtml(doc, 'BODY', "text/javascript", 
//                           MFGetFileExtension.toString()+
//                           MFParseMarkdownContent.toString()+
//                           "MFParseMarkdownContent(document,Markdown);"
//     );
//   else
//     MFAppendScriptInnerHtml(doc, 'BODY', "text/javascript", 
//                           MFGetFileExtension.toString()+
//                           MFParseMarkdownContent.toString()+
//                           "setTimeout(function(){MFParseMarkdownContent(document,Markdown);}, 200);"
//     );
// }

// function MFInit_marked(doc){
//   MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\marked\\marked.js"); 
//   MFAppendScriptSrc(doc, 'HEAD', "text/javascript", org_mode_pluginPath+"Markdown\\marked\\highlight.pack.js");
//   MFAppendCssSrc(doc, org_mode_pluginPath+"Markdown\\marked\\GitHub2.css");

//   if(MFIsIE())
// 	  MFAppendScriptInnerHtml(doc, 'HEAD', "text/javascript", 
// 	                        MFGetFileExtension.toString()+
// 	                        MFParseMarkdownContent.toString()+
// 	                        "MFParseMarkdownContent(document, marked);"
// 	  );
// 	else
// 	  MFAppendScriptInnerHtml(doc, 'HEAD', "text/javascript", 
// 	                        MFGetFileExtension.toString()+
// 	                        MFParseMarkdownContent.toString()+
// 	                        "setTimeout(function(){MFParseMarkdownContent(document, marked);}, 200);"
// 	  );
// }
